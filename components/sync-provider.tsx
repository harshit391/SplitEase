"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth-provider";
import { fullSync } from "@/lib/sync/sync-engine";
import type { SyncState } from "@/lib/sync/sync.types";

interface SyncContextType {
  syncState: SyncState;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType>({
  syncState: {
    status: "idle",
    lastSyncedAt: null,
    pendingChanges: 0,
    error: null,
  },
  triggerSync: async () => {},
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    lastSyncedAt: null,
    pendingChanges: 0,
    error: null,
  });

  const triggerSync = useCallback(async () => {
    if (!user || (typeof navigator !== "undefined" && !navigator.onLine))
      return;

    setSyncState((s) => ({ ...s, status: "syncing", error: null }));
    try {
      await fullSync(user.id);
      setSyncState({
        status: "idle",
        lastSyncedAt: new Date().toISOString(),
        pendingChanges: 0,
        error: null,
      });
      // Invalidate React Query cache so UI re-reads from updated local DB
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    } catch (err) {
      setSyncState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "Sync failed",
      }));
    }
  }, [user, queryClient]);

  // Sync on mount when authenticated and online
  useEffect(() => {
    if (user && typeof navigator !== "undefined" && navigator.onLine) {
      triggerSync();
    }
  }, [user, triggerSync]);

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (user) triggerSync();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user, triggerSync]);

  // Detect offline
  useEffect(() => {
    const handleOffline = () => {
      setSyncState((s) => ({ ...s, status: "offline" }));
    };
    const handleOnlineStatus = () => {
      setSyncState((s) => {
        if (s.status === "offline") return { ...s, status: "idle" };
        return s;
      });
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnlineStatus);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnlineStatus);
    };
  }, []);

  return (
    <SyncContext.Provider value={{ syncState, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
