import Dexie, { type Table } from "dexie";
import type { Trip } from "@/types";

export class SplitEaseDB extends Dexie {
  trips!: Table<Trip, string>;

  constructor() {
    super("SplitEaseDB");

    this.version(1).stores({
      trips: "id, name, createdAt",
    });
  }
}

export const db = new SplitEaseDB();
