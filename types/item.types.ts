export interface Item {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  taxPercent: number;
  taxValue: number;
  taxMode: "percentage" | "value";
  discountPercent: number;
  discountValue: number;
  discountMode: "percentage" | "value";
}

export interface ItemCreate {
  name: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  taxPercent?: number;
  taxValue?: number;
  taxMode?: "percentage" | "value";
  discountPercent?: number;
  discountValue?: number;
  discountMode?: "percentage" | "value";
}

export interface ItemUpdate {
  name?: string;
  amount?: number;
  paidBy?: string;
  splitAmong?: string[];
  taxPercent?: number;
  taxValue?: number;
  taxMode?: "percentage" | "value";
  discountPercent?: number;
  discountValue?: number;
  discountMode?: "percentage" | "value";
}
