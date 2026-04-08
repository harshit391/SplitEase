import { localRepository } from "@/database/local.repository";
import { createSupabaseRepository } from "@/database/supabase.repository";
import { createClient } from "@/lib/supabase/client";
import { tripToDb, expenseGroupToDb, itemToDb } from "@/database/mappers";
import type { LocalTrip } from "@/database/db";
import type { Trip } from "@/types";

async function pushTripToRemote(
  trip: Trip,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  // Step 1: Upsert trip row
  const { error: tripError } = await supabase.from("trips").upsert(
    {
      ...tripToDb(trip, userId),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (tripError) {
    console.error("[Sync] Failed to upsert trip:", tripError.message);
    return false;
  }

  // Step 2: Delete existing groups (CASCADE deletes items)
  const { error: deleteError } = await supabase
    .from("expense_groups")
    .delete()
    .eq("trip_id", trip.id);

  if (deleteError) {
    console.error("[Sync] Failed to delete groups:", deleteError.message);
    return false;
  }

  // Step 3: Re-insert all groups and items, abort on any failure
  for (let gi = 0; gi < trip.subTopics.length; gi++) {
    const group = trip.subTopics[gi];

    const { error: groupError } = await supabase
      .from("expense_groups")
      .insert(expenseGroupToDb(group, trip.id, gi));

    if (groupError) {
      console.error("[Sync] Failed to insert group:", groupError.message);
      return false;
    }

    if (group.items.length > 0) {
      const itemRows = group.items.map((item, ii) =>
        itemToDb(item, group.id, trip.id, ii)
      );

      const { error: itemsError } = await supabase
        .from("items")
        .insert(itemRows);

      if (itemsError) {
        console.error("[Sync] Failed to insert items:", itemsError.message);
        return false;
      }
    }
  }

  return true;
}

export async function pushPendingChanges(
  userId: string
): Promise<Set<string>> {
  const pendingTrips = await localRepository.getPending();
  const pushedIds = new Set<string>();

  const supabase = createClient();
  const remoteRepo = createSupabaseRepository(supabase, userId);

  for (const localTrip of pendingTrips) {
    try {
      const remoteTrip = await remoteRepo.getById(localTrip.id);

      let shouldPush = false;

      if (!remoteTrip) {
        shouldPush = true;
      } else {
        const localTime = new Date(localTrip.updated_at).getTime();
        const remoteUpdatedAt =
          (remoteTrip as unknown as { updated_at?: string }).updated_at ||
          remoteTrip.createdAt;
        const remoteTime = new Date(remoteUpdatedAt).getTime();

        if (localTime >= remoteTime) {
          shouldPush = true;
        }
      }

      if (shouldPush) {
        const success = await pushTripToRemote(localTrip, userId);
        if (success) {
          await localRepository.markSynced(localTrip.id);
          pushedIds.add(localTrip.id);
        }
        // If push failed, do NOT mark as synced — will retry next time
      } else {
        // Remote is newer, just mark synced (pull will handle update)
        await localRepository.markSynced(localTrip.id);
      }
    } catch (err) {
      console.error("[Sync] Push error for trip:", localTrip.id, err);
    }
  }

  return pushedIds;
}

function countTripItems(trip: Trip): number {
  return trip.subTopics.reduce(
    (sum, g) => sum + g.items.length,
    0
  );
}

export async function pullRemoteChanges(
  userId: string,
  justPushedIds: Set<string>
): Promise<void> {
  const supabase = createClient();
  const remoteRepo = createSupabaseRepository(supabase, userId);

  const remoteTrips = await remoteRepo.getAll();
  const localTrips = (await localRepository.getAll()) as LocalTrip[];

  const localTripMap = new Map(localTrips.map((t) => [t.id, t]));
  const remoteIds = new Set(remoteTrips.map((t) => t.id));

  for (const remoteTrip of remoteTrips) {
    // Skip trips we just pushed — local is the source of truth for those
    if (justPushedIds.has(remoteTrip.id)) continue;

    const localTrip = localTripMap.get(remoteTrip.id);

    if (!localTrip) {
      // New from remote — import locally
      await localRepository.replaceTrip(remoteTrip);
      continue;
    }

    if (localTrip.sync_status === "pending") {
      // Local has unsaved changes — don't overwrite
      continue;
    }

    // Safety: don't replace local if remote has significantly less data
    // (guards against corrupted/partial sync data)
    const localItemCount = countTripItems(localTrip);
    const remoteItemCount = countTripItems(remoteTrip);

    if (
      localItemCount > 0 &&
      remoteItemCount === 0 &&
      localTrip.subTopics.length > 0
    ) {
      console.warn(
        `[Sync] Skipping pull for trip "${localTrip.name}" — remote has 0 items vs local ${localItemCount}. Possible data loss.`
      );
      continue;
    }

    // Safe to update local with remote
    await localRepository.replaceTrip(remoteTrip);
  }

  // Handle remote deletions: only delete local trips that are synced AND not in remote
  // Do NOT delete trips that were never pushed (pending)
  for (const localTrip of localTrips) {
    if (
      localTrip.sync_status === "synced" &&
      !remoteIds.has(localTrip.id) &&
      !justPushedIds.has(localTrip.id)
    ) {
      await localRepository.delete(localTrip.id);
    }
  }
}

export async function fullSync(userId: string): Promise<void> {
  const pushedIds = await pushPendingChanges(userId);
  await pullRemoteChanges(userId, pushedIds);
}
