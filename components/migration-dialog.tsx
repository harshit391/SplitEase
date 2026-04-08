"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { useSync } from "./sync-provider";
import { localRepository } from "@/database/local.repository";

export function MigrationDialog() {
  const { user } = useAuth();
  const { triggerSync } = useSync();
  const [open, setOpen] = useState(false);
  const [localTripCount, setLocalTripCount] = useState(0);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const migrationKey = `migration-offered-${user.id}`;
    if (localStorage.getItem(migrationKey)) return;

    async function checkLocalTrips() {
      const pending = await localRepository.getPending();
      if (pending.length > 0) {
        setLocalTripCount(pending.length);
        setOpen(true);
      }
      localStorage.setItem(migrationKey, "true");
    }

    checkLocalTrips();
  }, [user]);

  const handleMigrate = async () => {
    setMigrating(true);
    await triggerSync();
    setMigrating(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <DialogTitle>Sync Local Trips</DialogTitle>
          <DialogDescription>
            We found {localTripCount} trip{localTripCount !== 1 ? "s" : ""}{" "}
            stored locally on this device. Would you like to sync them to
            your account?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Button
            variant="glow"
            className="flex-1"
            onClick={handleMigrate}
            disabled={migrating}
          >
            {migrating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Sync Now
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={migrating}
          >
            <X className="w-4 h-4" />
            Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
