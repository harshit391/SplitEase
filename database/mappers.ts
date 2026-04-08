import type { Trip, ExpenseGroup, Item } from "@/types";
import type { DbTrip, DbExpenseGroup, DbItem } from "@/types/supabase.types";

export function tripToDb(
  trip: Trip,
  userId: string
): Omit<DbTrip, "updated_at"> {
  return {
    id: trip.id,
    user_id: userId,
    name: trip.name,
    friends: trip.friends,
    google_sheet_url: trip.googleSheetUrl,
    default_payer: trip.defaultPayer,
    created_at: trip.createdAt,
  };
}

export function expenseGroupToDb(
  group: ExpenseGroup,
  tripId: string,
  sortOrder: number
): Omit<DbExpenseGroup, "created_at" | "updated_at"> {
  return {
    id: group.id,
    trip_id: tripId,
    name: group.name,
    tax_percent: group.taxPercent,
    tax_mode: group.taxMode,
    tax_value: group.taxValue,
    discount_percent: group.discountPercent,
    discount_value: group.discountValue,
    discount_mode: group.discountMode,
    tax_discount_level: group.taxDiscountLevel,
    sort_order: sortOrder,
  };
}

export function itemToDb(
  item: Item,
  expenseGroupId: string,
  tripId: string,
  sortOrder: number
): Omit<DbItem, "created_at" | "updated_at"> {
  return {
    id: item.id,
    expense_group_id: expenseGroupId,
    trip_id: tripId,
    name: item.name,
    amount: item.amount,
    paid_by: item.paidBy,
    split_among: item.splitAmong,
    tax_percent: item.taxPercent,
    tax_value: item.taxValue,
    tax_mode: item.taxMode,
    discount_percent: item.discountPercent,
    discount_value: item.discountValue,
    discount_mode: item.discountMode,
    sort_order: sortOrder,
  };
}

export function dbToExpenseGroup(
  g: DbExpenseGroup,
  items: DbItem[]
): ExpenseGroup {
  return {
    id: g.id,
    name: g.name,
    items: items
      .filter((i) => i.expense_group_id === g.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(dbToItem),
    taxPercent: Number(g.tax_percent),
    taxMode: g.tax_mode as "percentage" | "value",
    taxValue: Number(g.tax_value),
    discountPercent: Number(g.discount_percent),
    discountValue: Number(g.discount_value),
    discountMode: g.discount_mode as "percentage" | "value",
    taxDiscountLevel: g.tax_discount_level as "group" | "item",
  };
}

export function dbToItem(i: DbItem): Item {
  return {
    id: i.id,
    name: i.name,
    amount: Number(i.amount),
    paidBy: i.paid_by,
    splitAmong: i.split_among,
    taxPercent: Number(i.tax_percent),
    taxValue: Number(i.tax_value),
    taxMode: i.tax_mode as "percentage" | "value",
    discountPercent: Number(i.discount_percent),
    discountValue: Number(i.discount_value),
    discountMode: i.discount_mode as "percentage" | "value",
  };
}

export function dbToTrip(
  t: DbTrip,
  groups: DbExpenseGroup[],
  items: DbItem[]
): Trip {
  return {
    id: t.id,
    name: t.name,
    friends: t.friends,
    subTopics: groups
      .filter((g) => g.trip_id === t.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((g) => dbToExpenseGroup(g, items)),
    createdAt: t.created_at,
    googleSheetUrl: t.google_sheet_url,
    defaultPayer: t.default_payer,
  };
}
