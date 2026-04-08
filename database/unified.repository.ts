import { localRepository } from "./local.repository";
import { createSupabaseRepository } from "./supabase.repository";
import { createClient } from "@/lib/supabase/client";
import { tripToDb, expenseGroupToDb, itemToDb } from "./mappers";
import type { ITripsRepository } from "./repository.interface";
import type { Trip } from "@/types";

// Debounce map to prevent overlapping pushes per trip
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function backgroundPush(tripId: string, userId: string): Promise<void> {
  // Debounce: wait 1s after last mutation before pushing
  const existing = pushTimers.get(tripId);
  if (existing) clearTimeout(existing);

  pushTimers.set(
    tripId,
    setTimeout(async () => {
      pushTimers.delete(tripId);
      if (typeof navigator === "undefined" || !navigator.onLine) return;

      try {
        const supabase = createClient();
        const trip = (await localRepository.getById(tripId)) as Trip | undefined;
        if (!trip) {
          await supabase.from("trips").delete().eq("id", tripId);
          return;
        }

        // Upsert trip row
        const { error: tripError } = await supabase.from("trips").upsert(
          {
            ...tripToDb(trip, userId),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        if (tripError) return; // Don't proceed if trip upsert failed

        // Delete existing groups (CASCADE deletes items)
        const { error: deleteError } = await supabase
          .from("expense_groups")
          .delete()
          .eq("trip_id", tripId);
        if (deleteError) return;

        // Re-insert groups and items — abort on any failure
        let insertFailed = false;
        for (let gi = 0; gi < trip.subTopics.length; gi++) {
          const group = trip.subTopics[gi];

          const { error: groupError } = await supabase
            .from("expense_groups")
            .insert(expenseGroupToDb(group, tripId, gi));
          if (groupError) { insertFailed = true; break; }

          if (group.items.length > 0) {
            const itemRows = group.items.map((item, ii) =>
              itemToDb(item, group.id, tripId, ii)
            );
            const { error: itemsError } = await supabase
              .from("items")
              .insert(itemRows);
            if (itemsError) { insertFailed = true; break; }
          }
        }

        // Only mark synced if everything succeeded
        if (!insertFailed) {
          await localRepository.markSynced(tripId);
        }
      } catch {
        // Will retry on next mutation or full sync
      }
    }, 1000)
  );
}

export function createUnifiedRepository(
  userId: string | null
): ITripsRepository {
  return {
    async getAll() {
      return localRepository.getAll();
    },

    async getById(id) {
      return localRepository.getById(id);
    },

    async create(data) {
      const trip = await localRepository.create(data);
      if (userId) backgroundPush(trip.id, userId);
      return trip;
    },

    async update(id, updates) {
      const trip = await localRepository.update(id, updates);
      if (userId) backgroundPush(id, userId);
      return trip;
    },

    async delete(id) {
      await localRepository.delete(id);
      if (userId) {
        try {
          const supabase = createClient();
          await supabase.from("trips").delete().eq("id", id);
        } catch {
          // Will be cleaned up on next sync
        }
      }
    },

    async import(trip) {
      const imported = await localRepository.import(trip);
      if (userId) backgroundPush(imported.id, userId);
      return imported;
    },

    async addExpenseGroup(tripId, data) {
      const group = await localRepository.addExpenseGroup(tripId, data);
      if (userId) backgroundPush(tripId, userId);
      return group;
    },

    async updateExpenseGroup(tripId, expenseGroupId, updates) {
      const group = await localRepository.updateExpenseGroup(
        tripId,
        expenseGroupId,
        updates
      );
      if (userId) backgroundPush(tripId, userId);
      return group;
    },

    async deleteExpenseGroup(tripId, expenseGroupId) {
      await localRepository.deleteExpenseGroup(tripId, expenseGroupId);
      if (userId) backgroundPush(tripId, userId);
    },

    async addItem(tripId, expenseGroupId, data) {
      const item = await localRepository.addItem(
        tripId,
        expenseGroupId,
        data
      );
      if (userId) backgroundPush(tripId, userId);
      return item;
    },

    async updateItem(tripId, expenseGroupId, itemId, updates) {
      const item = await localRepository.updateItem(
        tripId,
        expenseGroupId,
        itemId,
        updates
      );
      if (userId) backgroundPush(tripId, userId);
      return item;
    },

    async deleteItem(tripId, expenseGroupId, itemId) {
      await localRepository.deleteItem(tripId, expenseGroupId, itemId);
      if (userId) backgroundPush(tripId, userId);
    },
  };
}
