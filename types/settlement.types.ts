export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface PersonBalance {
  owes: number;
  paid: number;
}

export interface SettlementStep {
  stepNumber: number;
  debtor: string;
  debtorAmount: number;
  creditor: string;
  creditorAmount: number;
  settlementAmount: number;
  balancesAfter: Record<string, number>;
}

export interface SettlementResult {
  balances: Record<string, PersonBalance>;
  nets: Record<string, number>;
  settlements: Settlement[];
  steps: SettlementStep[];
}

export interface SubTopicTotals {
  totals: Record<string, number>;
  baseTotals: Record<string, number>;
  taxPerPerson: Record<string, number>;
  totalTax: number;
  subTopicTotal: number;
}
