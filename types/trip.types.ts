import type { ExpenseGroup } from "./expense.types";

export interface Trip {
  id: string;
  name: string;
  friends: string[];
  subTopics: ExpenseGroup[];
  createdAt: string;
  googleSheetUrl: string | null;
  defaultPayer: string | null;
  userId?: string;
  sharedWith?: string[];
  shareCode?: string | null;
}

export interface TripCreate {
  name: string;
  friends: string[];
  defaultPayer?: string | null;
}

export interface TripUpdate {
  name?: string;
  friends?: string[];
  googleSheetUrl?: string | null;
  defaultPayer?: string | null;
}
