export interface Item {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
}

export interface ItemCreate {
  name: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
}

export interface ItemUpdate {
  name?: string;
  amount?: number;
  paidBy?: string;
  splitAmong?: string[];
}
