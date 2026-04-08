import { localRepository } from "@/database/local.repository";
import { createSupabaseRepository } from "@/database/supabase.repository";
import { createClient } from "@/lib/supabase/client";
import { tripToDb, expenseGroupToDb, itemToDb } from "@/database/mappers";
import type { LocalTrip } from "@/database/db";
import type { Trip } from "@/types";

async function pushTripToRemote(
  trip: Trip,
  userId: string
): Promise<void> {
  const supabase = createClient();

  // Upsert trip
  await supabase.from("trips").upsert(
    {
      ...tripToDb(trip, userId),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  // Delete all existing groups for this trip (CASCADE deletes items)
  await supabase
    .from("expense_groups")
    .delete()
    .eq("trip_id", trip.id);

  // Re-insert all groups and items
  for (let gi = 0; gi < trip.subTopics.length; gi++) {
    const group = trip.subTopics[gi];
    await supabase
      .from("expense_groups")
      .insert(expenseGroupToDb(group, trip.id, gi));

    if (group.items.length > 0) {
      const itemRows = group.items.map((item, ii) =>
        itemToDb(item, group.id, trip.id, ii)
      );
      await supabase.from("items").insert(itemRows);
    }
  }
}

export async function pushPendingChanges(userId: string): Promise<void> {
  const pendingTrips = await localRepository.getPending();

  const supabase = createClient();
  const remoteRepo = createSupabaseRepository(supabase, userId);

  for (const localTrip of pendingTrips) {
    try {
      const remoteTrip = await remoteRepo.getById(localTrip.id);

      if (!remoteTrip) {
        // New trip — push entirely
        await pushTripToRemote(localTrip, userId);
      } else {
        // Compare timestamps — last write wins
        const localTime = new Date(localTrip.updated_at).getTime();
        const remoteTime = new Date(
          (remoteTrip as unknown as { updated_at?: string }).updated_at ||
            remoteTrip.createdAt
        ).getTime();

        if (localTime >= remoteTime) {
          await pushTripToRemote(localTrip, userId);
        }
        // If remote is newer, skip — pull will handle it
      }

      await localRepository.markSynced(localTrip.id);
    } catch {
      // Skip this trip, continue with others
    }
  }
}

export async function pullRemoteChanges(userId: string): Promise<void> {
  const supabase = createClient();
  const remoteRepo = createSupabaseRepository(supabase, userId);

  const remoteTrips = await remoteRepo.getAll();
  const localTrips = (await localRepository.getAll()) as LocalTrip[];

  const localTripMap = new Map(localTrips.map((t) => [t.id, t]));
  const remoteIds = new Set(remoteTrips.map((t) => t.id));

  for (const remoteTrip of remoteTrips) {
    const localTrip = localTripMap.get(remoteTrip.id);

    if (!localTrip) {
      // New from remote — import locally
      await localRepository.replaceTrip(remoteTrip);
    } else if (localTrip.sync_status === "synced") {
      // No local changes — safe to overwrite
      await localRepository.replaceTrip(remoteTrip);
    } else if (localTrip.sync_status === "pending") {
      // Conflict — last write wins
      const localTime = new Date(localTrip.updated_at).getTime();
      const remoteTime = new Date(remoteTrip.createdAt).getTime();

      if (remoteTime > localTime) {
        await localRepository.replaceTrip(remoteTrip);
      }
      // If local is newer, keep local — will be pushed on next push cycle
    }
  }

  // Handle remote deletions: synced local trips not in remote
  for (const localTrip of localTrips) {
    if (
      localTrip.sync_status === "synced" &&
      !remoteIds.has(localTrip.id)
    ) {
      await localRepository.delete(localTrip.id);
    }
  }
}

export async function fullSync(userId: string): Promise<void> {
  await pushPendingChanges(userId);
  await pullRemoteChanges(userId);
}
