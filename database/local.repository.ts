import { db, type LocalTrip } from "./db";
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
} from "@/types";
import { generateTripId, generateId } from "@/utils";
import type { ITripsRepository } from "./repository.interface";

function markPending(trip: LocalTrip): LocalTrip {
  trip.updated_at = new Date().toISOString();
  trip.sync_status = "pending";
  return trip;
}

export const localRepository: ITripsRepository & {
  markSynced(id: string): Promise<void>;
  replaceTrip(trip: Trip): Promise<void>;
  getPending(): Promise<LocalTrip[]>;
} = {
  async getAll(): Promise<Trip[]> {
    return db.trips.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<Trip | undefined> {
    return db.trips.get(id);
  },

  async create(data: TripCreate): Promise<Trip> {
    const id = generateTripId(data.name);
    const now = new Date().toISOString();
    const trip: LocalTrip = {
      id,
      name: data.name,
      friends: data.friends,
      subTopics: [],
      createdAt: now,
      googleSheetUrl: null,
      defaultPayer: data.defaultPayer || null,
      updated_at: now,
      sync_status: "pending",
    };
    await db.trips.add(trip);
    return trip;
  },

  async update(id: string, updates: TripUpdate): Promise<Trip | undefined> {
    const trip = await db.trips.get(id);
    if (!trip) return undefined;

    if (updates.name !== undefined) trip.name = updates.name;
    if (updates.friends !== undefined) trip.friends = updates.friends;
    if (updates.googleSheetUrl !== undefined)
      trip.googleSheetUrl = updates.googleSheetUrl;
    if (updates.defaultPayer !== undefined)
      trip.defaultPayer = updates.defaultPayer;

    markPending(trip);
    await db.trips.put(trip);
    return trip;
  },

  async delete(id: string): Promise<void> {
    await db.trips.delete(id);
  },

  async import(trip: Trip): Promise<Trip> {
    const existingTrip = await db.trips.get(trip.id);
    if (existingTrip) {
      const timestamp = Date.now().toString(36);
      trip.id = `${trip.id}-imported-${timestamp}`;
    }

    const now = new Date().toISOString();
    const importedTrip: LocalTrip = {
      ...trip,
      subTopics: (trip.subTopics || []).map((sub) => ({
        ...sub,
        taxMode: sub.taxMode || "percentage",
        taxValue: sub.taxValue || 0,
        discountPercent: sub.discountPercent || 0,
        discountValue: sub.discountValue || 0,
        discountMode: sub.discountMode || "percentage",
        taxDiscountLevel: sub.taxDiscountLevel || "group",
        items: (sub.items || []).map((item) => ({
          ...item,
          taxPercent: item.taxPercent ?? 0,
          taxValue: item.taxValue ?? 0,
          taxMode: item.taxMode || "percentage",
          discountPercent: item.discountPercent ?? 0,
          discountValue: item.discountValue ?? 0,
          discountMode: item.discountMode || "percentage",
        })),
      })),
      createdAt: trip.createdAt || now,
      googleSheetUrl: trip.googleSheetUrl || null,
      defaultPayer: trip.defaultPayer || null,
      updated_at: now,
      sync_status: "pending",
    };

    await db.trips.add(importedTrip);
    return importedTrip;
  },

  async addExpenseGroup(
    tripId: string,
    data: ExpenseGroupCreate
  ): Promise<ExpenseGroup | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup: ExpenseGroup = {
      id: generateId(),
      name: data.name,
      items: [],
      taxPercent: 0,
      taxMode: "percentage",
      taxValue: 0,
      discountPercent: 0,
      discountValue: 0,
      discountMode: "percentage",
      taxDiscountLevel: "group",
    };

    trip.subTopics.push(expenseGroup);
    markPending(trip);
    await db.trips.put(trip);
    return expenseGroup;
  },

  async updateExpenseGroup(
    tripId: string,
    expenseGroupId: string,
    updates: ExpenseGroupUpdate
  ): Promise<ExpenseGroup | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return undefined;

    if (updates.name !== undefined) expenseGroup.name = updates.name;
    if (updates.taxPercent !== undefined)
      expenseGroup.taxPercent = updates.taxPercent;
    if (updates.taxMode !== undefined)
      expenseGroup.taxMode = updates.taxMode;
    if (updates.taxValue !== undefined)
      expenseGroup.taxValue = updates.taxValue;
    if (updates.discountPercent !== undefined)
      expenseGroup.discountPercent = updates.discountPercent;
    if (updates.discountValue !== undefined)
      expenseGroup.discountValue = updates.discountValue;
    if (updates.discountMode !== undefined)
      expenseGroup.discountMode = updates.discountMode;
    if (updates.taxDiscountLevel !== undefined)
      expenseGroup.taxDiscountLevel = updates.taxDiscountLevel;

    markPending(trip);
    await db.trips.put(trip);
    return expenseGroup;
  },

  async deleteExpenseGroup(
    tripId: string,
    expenseGroupId: string
  ): Promise<void> {
    const trip = await db.trips.get(tripId);
    if (!trip) return;

    trip.subTopics = trip.subTopics.filter((s) => s.id !== expenseGroupId);
    markPending(trip);
    await db.trips.put(trip);
  },

  async addItem(
    tripId: string,
    expenseGroupId: string,
    data: ItemCreate
  ): Promise<Item | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return undefined;

    const item: Item = {
      id: generateId(),
      name: data.name,
      amount: data.amount,
      paidBy: data.paidBy,
      splitAmong: data.splitAmong,
      taxPercent: data.taxPercent ?? 0,
      taxValue: data.taxValue ?? 0,
      taxMode: data.taxMode ?? "percentage",
      discountPercent: data.discountPercent ?? 0,
      discountValue: data.discountValue ?? 0,
      discountMode: data.discountMode ?? "percentage",
    };

    expenseGroup.items.push(item);
    markPending(trip);
    await db.trips.put(trip);
    return item;
  },

  async updateItem(
    tripId: string,
    expenseGroupId: string,
    itemId: string,
    updates: ItemUpdate
  ): Promise<Item | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return undefined;

    const item = expenseGroup.items.find((i) => i.id === itemId);
    if (!item) return undefined;

    if (updates.name !== undefined) item.name = updates.name;
    if (updates.amount !== undefined) item.amount = updates.amount;
    if (updates.paidBy !== undefined) item.paidBy = updates.paidBy;
    if (updates.splitAmong !== undefined) item.splitAmong = updates.splitAmong;
    if (updates.taxPercent !== undefined) item.taxPercent = updates.taxPercent;
    if (updates.taxValue !== undefined) item.taxValue = updates.taxValue;
    if (updates.taxMode !== undefined) item.taxMode = updates.taxMode;
    if (updates.discountPercent !== undefined)
      item.discountPercent = updates.discountPercent;
    if (updates.discountValue !== undefined)
      item.discountValue = updates.discountValue;
    if (updates.discountMode !== undefined)
      item.discountMode = updates.discountMode;

    markPending(trip);
    await db.trips.put(trip);
    return item;
  },

  async deleteItem(
    tripId: string,
    expenseGroupId: string,
    itemId: string
  ): Promise<void> {
    const trip = await db.trips.get(tripId);
    if (!trip) return;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return;

    expenseGroup.items = expenseGroup.items.filter((i) => i.id !== itemId);
    markPending(trip);
    await db.trips.put(trip);
  },

  // Sync helper methods
  async markSynced(id: string): Promise<void> {
    await db.trips.update(id, { sync_status: "synced" });
  },

  async replaceTrip(trip: Trip): Promise<void> {
    const localTrip: LocalTrip = {
      ...trip,
      updated_at:
        (trip as LocalTrip).updated_at ||
        trip.createdAt ||
        new Date().toISOString(),
      sync_status: "synced",
    };
    await db.trips.put(localTrip);
  },

  async getPending(): Promise<LocalTrip[]> {
    return db.trips.where("sync_status").equals("pending").toArray();
  },
};
