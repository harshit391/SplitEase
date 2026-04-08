"use client";

import { Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSync } from "./sync-provider";

export function SyncStatusBadge() {
  const { syncState, triggerSync } = useSync();

  if (syncState.status === "syncing") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
        <span className="text-[10px] text-blue-400 font-medium hidden sm:inline">
          Syncing
        </span>
      </div>
    );
  }

  if (syncState.status === "offline") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
        <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
          Offline
        </span>
      </div>
    );
  }

  if (syncState.status === "error") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={triggerSync}
        className="flex items-center gap-1.5 px-2.5 py-1 h-auto rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20"
        title={syncState.error || "Sync failed — click to retry"}
      >
        <AlertCircle className="w-3.5 h-3.5 text-destructive" />
        <span className="text-[10px] text-destructive font-medium hidden sm:inline">
          Error
        </span>
      </Button>
    );
  }

  // idle / synced
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <Cloud className="w-3.5 h-3.5 text-emerald-400" />
      <span className="text-[10px] text-emerald-400 font-medium hidden sm:inline">
        Synced
      </span>
    </div>
  );
}
