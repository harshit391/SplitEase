export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingChanges: number;
  error: string | null;
}
