import type { Item } from "./item.types";

export interface ExpenseGroup {
  id: string;
  name: string;
  items: Item[];
  taxPercent: number;
}

export interface ExpenseGroupCreate {
  name: string;
}

export interface ExpenseGroupUpdate {
  name?: string;
  taxPercent?: number;
}
