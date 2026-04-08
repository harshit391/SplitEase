import type { Item } from "./item.types";

export interface ExpenseGroup {
  id: string;
  name: string;
  items: Item[];
  taxPercent: number;
  taxMode: "percentage" | "value";
  taxValue: number;
  discountPercent: number;
  discountValue: number;
  discountMode: "percentage" | "value";
  taxDiscountLevel: "group" | "item";
}

export interface ExpenseGroupCreate {
  name: string;
}

export interface ExpenseGroupUpdate {
  name?: string;
  taxPercent?: number;
  taxMode?: "percentage" | "value";
  taxValue?: number;
  discountPercent?: number;
  discountValue?: number;
  discountMode?: "percentage" | "value";
  taxDiscountLevel?: "group" | "item";
}
