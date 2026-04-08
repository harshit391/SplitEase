import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Trip,
  TripCreate,
  TripUpdate,
  ExpenseGroup,
  ExpenseGroupCreate,
  ExpenseGroupUpdate,
  Item,
  ItemCreate,
  ItemUpdate,
  DbTripShare,
} from "@/types";
import { generateTripId, generateId } from "@/utils";
import type { ITripsRepository } from "./repository.interface";
import {
  tripToDb,
  expenseGroupToDb,
  itemToDb,
  dbToTrip,
  dbToExpenseGroup,
  dbToItem,
} from "./mappers";

export interface ShareRepository {
  getShares(tripId: string): Promise<DbTripShare[]>;
  addPrivateShare(tripId: string, email: string): Promise<DbTripShare | null>;
  removeShare(shareId: string): Promise<void>;
  enablePublicShare(tripId: string): Promise<DbTripShare | null>;
  disablePublicShare(tripId: string): Promise<void>;
  getTripByShareCode(code: string): Promise<Trip | undefined>;
}

export function createShareRepository(
  supabase: SupabaseClient,
  userId?: string
): ShareRepository {
  return {
    async getShares(tripId: string): Promise<DbTripShare[]> {
      const { data } = await supabase
        .from("trip_shares")
        .select("*")
        .eq("trip_id", tripId);
      return (data as DbTripShare[]) || [];
    },

    async addPrivateShare(
      tripId: string,
      email: string
    ): Promise<DbTripShare | null> {
      // Check if already shared
      const { data: existing } = await supabase
        .from("trip_shares")
        .select("*")
        .eq("trip_id", tripId)
        .eq("shared_with_email", email)
        .eq("share_type", "private")
        .maybeSingle();

      if (existing) return existing as DbTripShare;

      const { data, error } = await supabase
        .from("trip_shares")
        .insert({
          trip_id: tripId,
          user_id: userId,
          shared_with_email: email,
          share_type: "private",
        })
        .select()
        .single();

      if (error) return null;
      return data as DbTripShare;
    },

    async removeShare(shareId: string): Promise<void> {
      await supabase.from("trip_shares").delete().eq("id", shareId);
    },

    async enablePublicShare(
      tripId: string
    ): Promise<DbTripShare | null> {
      // Check if already has public share
      const { data: existing } = await supabase
        .from("trip_shares")
        .select("*")
        .eq("trip_id", tripId)
        .eq("share_type", "public")
        .maybeSingle();

      if (existing) return existing as DbTripShare;

      const shareCode =
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);

      const { data, error } = await supabase
        .from("trip_shares")
        .insert({
          trip_id: tripId,
          user_id: userId,
          share_type: "public",
          share_code: shareCode,
        })
        .select()
        .single();

      if (error) return null;
      return data as DbTripShare;
    },

    async disablePublicShare(tripId: string): Promise<void> {
      await supabase
        .from("trip_shares")
        .delete()
        .eq("trip_id", tripId)
        .eq("share_type", "public");
    },

    async getTripByShareCode(code: string): Promise<Trip | undefined> {
      const { data: share } = await supabase
        .from("trip_shares")
        .select("trip_id")
        .eq("share_code", code)
        .eq("share_type", "public")
        .maybeSingle();

      if (!share) return undefined;

      const tripId = share.trip_id;

      const [tripResult, groupsResult, itemsResult] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase.from("expense_groups").select("*").eq("trip_id", tripId),
        supabase.from("items").select("*").eq("trip_id", tripId),
      ]);

      if (!tripResult.data) return undefined;

      return dbToTrip(
        tripResult.data,
        groupsResult.data || [],
        itemsResult.data || []
      );
    },
  };
}

export interface SavedTripsRepository {
  getSavedTrips(): Promise<Trip[]>;
  saveTrip(tripId: string): Promise<boolean>;
  unsaveTrip(tripId: string): Promise<void>;
  isTripSaved(tripId: string): Promise<boolean>;
}

export function createSavedTripsRepository(
  supabase: SupabaseClient,
  userId: string
): SavedTripsRepository {
  return {
    async getSavedTrips(): Promise<Trip[]> {
      const { data: saved } = await supabase
        .from("saved_trips")
        .select("trip_id")
        .eq("user_id", userId);

      if (!saved || saved.length === 0) return [];

      const tripIds = saved.map((s) => s.trip_id);

      const [tripsResult, groupsResult, itemsResult, sharesResult] =
        await Promise.all([
          supabase.from("trips").select("*").in("id", tripIds),
          supabase.from("expense_groups").select("*").in("trip_id", tripIds),
          supabase.from("items").select("*").in("trip_id", tripIds),
          supabase
            .from("trip_shares")
            .select("trip_id, share_code")
            .in("trip_id", tripIds)
            .eq("share_type", "public"),
        ]);

      const trips = tripsResult.data || [];
      const groups = groupsResult.data || [];
      const items = itemsResult.data || [];
      const shares = sharesResult.data || [];

      const shareCodeMap = new Map(
        shares
          .filter((s) => s.share_code)
          .map((s) => [s.trip_id, s.share_code])
      );

      return trips.map((t) => ({
        ...dbToTrip(t, groups, items),
        shareCode: shareCodeMap.get(t.id) || null,
      }));
    },

    async saveTrip(tripId: string): Promise<boolean> {
      const { error } = await supabase
        .from("saved_trips")
        .insert({ user_id: userId, trip_id: tripId });
      return !error;
    },

    async unsaveTrip(tripId: string): Promise<void> {
      await supabase
        .from("saved_trips")
        .delete()
        .eq("user_id", userId)
        .eq("trip_id", tripId);
    },

    async isTripSaved(tripId: string): Promise<boolean> {
      const { data } = await supabase
        .from("saved_trips")
        .select("id")
        .eq("user_id", userId)
        .eq("trip_id", tripId)
        .maybeSingle();
      return !!data;
    },
  };
}

export function createSupabaseRepository(
  supabase: SupabaseClient,
  userId: string
): ITripsRepository {
  return {
    async getAll(): Promise<Trip[]> {
      const { data: trips } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!trips || trips.length === 0) return [];

      const tripIds = trips.map((t) => t.id);

      const [groupsResult, itemsResult] = await Promise.all([
        supabase
          .from("expense_groups")
          .select("*")
          .in("trip_id", tripIds),
        supabase.from("items").select("*").in("trip_id", tripIds),
      ]);

      const groups = groupsResult.data || [];
      const items = itemsResult.data || [];

      return trips.map((t) => dbToTrip(t, groups, items));
    },

    async getById(id: string): Promise<Trip | undefined> {
      const { data: trip } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (!trip) return undefined;

      const [groupsResult, itemsResult] = await Promise.all([
        supabase
          .from("expense_groups")
          .select("*")
          .eq("trip_id", id),
        supabase.from("items").select("*").eq("trip_id", id),
      ]);

      return dbToTrip(trip, groupsResult.data || [], itemsResult.data || []);
    },

    async create(data: TripCreate): Promise<Trip> {
      const id = generateTripId(data.name);

      const { data: trip, error } = await supabase
        .from("trips")
        .insert({
          id,
          user_id: userId,
          name: data.name,
          friends: data.friends,
          default_payer: data.defaultPayer || null,
        })
        .select()
        .single();

      if (error || !trip)
        throw new Error(error?.message || "Failed to create trip");

      return dbToTrip(trip, [], []);
    },

    async update(id: string, updates: TripUpdate): Promise<Trip | undefined> {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.friends !== undefined) dbUpdates.friends = updates.friends;
      if (updates.googleSheetUrl !== undefined)
        dbUpdates.google_sheet_url = updates.googleSheetUrl;
      if (updates.defaultPayer !== undefined)
        dbUpdates.default_payer = updates.defaultPayer;

      await supabase.from("trips").update(dbUpdates).eq("id", id);

      return this.getById(id);
    },

    async delete(id: string): Promise<void> {
      await supabase.from("trips").delete().eq("id", id);
    },

    async import(trip: Trip): Promise<Trip> {
      // Check for existing
      const { data: existing } = await supabase
        .from("trips")
        .select("id")
        .eq("id", trip.id)
        .single();

      let tripId = trip.id;
      if (existing) {
        const timestamp = Date.now().toString(36);
        tripId = `${trip.id}-imported-${timestamp}`;
      }

      const tripWithId = { ...trip, id: tripId };

      // Insert trip
      await supabase
        .from("trips")
        .insert(tripToDb(tripWithId, userId));

      // Insert expense groups and items
      for (let gi = 0; gi < (trip.subTopics || []).length; gi++) {
        const group = trip.subTopics[gi];
        await supabase
          .from("expense_groups")
          .insert(expenseGroupToDb(group, tripId, gi));

        if (group.items.length > 0) {
          const itemRows = group.items.map((item, ii) =>
            itemToDb(item, group.id, tripId, ii)
          );
          await supabase.from("items").insert(itemRows);
        }
      }

      return (await this.getById(tripId)) || tripWithId;
    },

    async addExpenseGroup(
      tripId: string,
      data: ExpenseGroupCreate
    ): Promise<ExpenseGroup | undefined> {
      const id = generateId();

      const { data: existing } = await supabase
        .from("expense_groups")
        .select("sort_order")
        .eq("trip_id", tripId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      const { data: group, error } = await supabase
        .from("expense_groups")
        .insert({
          id,
          trip_id: tripId,
          name: data.name,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error || !group) return undefined;

      return dbToExpenseGroup(group, []);
    },

    async updateExpenseGroup(
      tripId: string,
      expenseGroupId: string,
      updates: ExpenseGroupUpdate
    ): Promise<ExpenseGroup | undefined> {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.taxPercent !== undefined)
        dbUpdates.tax_percent = updates.taxPercent;
      if (updates.taxMode !== undefined) dbUpdates.tax_mode = updates.taxMode;
      if (updates.taxValue !== undefined)
        dbUpdates.tax_value = updates.taxValue;
      if (updates.discountPercent !== undefined)
        dbUpdates.discount_percent = updates.discountPercent;
      if (updates.discountValue !== undefined)
        dbUpdates.discount_value = updates.discountValue;
      if (updates.discountMode !== undefined)
        dbUpdates.discount_mode = updates.discountMode;
      if (updates.taxDiscountLevel !== undefined)
        dbUpdates.tax_discount_level = updates.taxDiscountLevel;

      const { data: group } = await supabase
        .from("expense_groups")
        .update(dbUpdates)
        .eq("id", expenseGroupId)
        .select()
        .single();

      if (!group) return undefined;

      const { data: items } = await supabase
        .from("items")
        .select("*")
        .eq("expense_group_id", expenseGroupId);

      return dbToExpenseGroup(group, items || []);
    },

    async deleteExpenseGroup(
      tripId: string,
      expenseGroupId: string
    ): Promise<void> {
      await supabase
        .from("expense_groups")
        .delete()
        .eq("id", expenseGroupId);
    },

    async addItem(
      tripId: string,
      expenseGroupId: string,
      data: ItemCreate
    ): Promise<Item | undefined> {
      const id = generateId();

      const { data: existing } = await supabase
        .from("items")
        .select("sort_order")
        .eq("expense_group_id", expenseGroupId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      const { data: item, error } = await supabase
        .from("items")
        .insert({
          id,
          expense_group_id: expenseGroupId,
          trip_id: tripId,
          name: data.name,
          amount: data.amount,
          paid_by: data.paidBy,
          split_among: data.splitAmong,
          tax_percent: data.taxPercent ?? 0,
          tax_value: data.taxValue ?? 0,
          tax_mode: data.taxMode ?? "percentage",
          discount_percent: data.discountPercent ?? 0,
          discount_value: data.discountValue ?? 0,
          discount_mode: data.discountMode ?? "percentage",
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error || !item) return undefined;

      return dbToItem(item);
    },

    async updateItem(
      tripId: string,
      expenseGroupId: string,
      itemId: string,
      updates: ItemUpdate
    ): Promise<Item | undefined> {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.paidBy !== undefined) dbUpdates.paid_by = updates.paidBy;
      if (updates.splitAmong !== undefined)
        dbUpdates.split_among = updates.splitAmong;
      if (updates.taxPercent !== undefined)
        dbUpdates.tax_percent = updates.taxPercent;
      if (updates.taxValue !== undefined)
        dbUpdates.tax_value = updates.taxValue;
      if (updates.taxMode !== undefined) dbUpdates.tax_mode = updates.taxMode;
      if (updates.discountPercent !== undefined)
        dbUpdates.discount_percent = updates.discountPercent;
      if (updates.discountValue !== undefined)
        dbUpdates.discount_value = updates.discountValue;
      if (updates.discountMode !== undefined)
        dbUpdates.discount_mode = updates.discountMode;

      const { data: item } = await supabase
        .from("items")
        .update(dbUpdates)
        .eq("id", itemId)
        .select()
        .single();

      if (!item) return undefined;
      return dbToItem(item);
    },

    async deleteItem(
      tripId: string,
      expenseGroupId: string,
      itemId: string
    ): Promise<void> {
      await supabase.from("items").delete().eq("id", itemId);
    },
  };
}
