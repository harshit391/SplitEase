export interface DbTrip {
  id: string;
  user_id: string;
  name: string;
  friends: string[];
  google_sheet_url: string | null;
  default_payer: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbExpenseGroup {
  id: string;
  trip_id: string;
  name: string;
  tax_percent: number;
  tax_mode: "percentage" | "value";
  tax_value: number;
  discount_percent: number;
  discount_value: number;
  discount_mode: "percentage" | "value";
  tax_discount_level: "group" | "item";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbItem {
  id: string;
  expense_group_id: string;
  trip_id: string;
  name: string;
  amount: number;
  paid_by: string;
  split_among: string[];
  tax_percent: number;
  tax_value: number;
  tax_mode: "percentage" | "value";
  discount_percent: number;
  discount_value: number;
  discount_mode: "percentage" | "value";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
