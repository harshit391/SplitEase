import Dexie, { type Table } from "dexie";
import type { Trip } from "@/types";

export interface LocalTrip extends Trip {
  updated_at: string;
  sync_status: "synced" | "pending" | "conflict";
}

export class SplitEaseDB extends Dexie {
  trips!: Table<LocalTrip, string>;

  constructor() {
    super("SplitEaseDB");

    this.version(1).stores({
      trips: "id, name, createdAt",
    });

    this.version(2)
      .stores({
        trips: "id, name, createdAt, updated_at, sync_status",
      })
      .upgrade((tx) => {
        return tx
          .table("trips")
          .toCollection()
          .modify((trip: Record<string, unknown>) => {
            trip.updated_at =
              trip.updated_at ||
              (trip.createdAt as string) ||
              new Date().toISOString();
            trip.sync_status = "pending";
          });
      });
  }
}

export const db = new SplitEaseDB();
