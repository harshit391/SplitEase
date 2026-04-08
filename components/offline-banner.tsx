"use client";

import { CloudOff } from "lucide-react";
import { useSync } from "./sync-provider";

export function OfflineBanner() {
  const { syncState } = useSync();

  if (syncState.status !== "offline") return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
      <span className="inline-flex items-center gap-2 text-xs text-amber-400 font-medium">
        <CloudOff className="w-3.5 h-3.5" />
        You are offline. Changes will sync when you reconnect.
      </span>
    </div>
  );
}
