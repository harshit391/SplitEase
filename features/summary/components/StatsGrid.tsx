"use client";

import { Users, Receipt, TrendingUp, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils";

interface StatsGridProps {
  friendsCount: number;
  expensesCount: number;
  totalSpent: number;
  perPerson: number;
}

export function StatsGrid({
  friendsCount,
  expensesCount,
  totalSpent,
  perPerson,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-2xl bg-card border border-white/5 p-5 transition-all duration-200 hover:border-primary/20">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{friendsCount}</div>
        <div className="text-xs text-muted-foreground mt-1">Friends</div>
      </div>

      <div className="rounded-2xl bg-card border border-white/5 p-5 transition-all duration-200 hover:border-primary/20">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{expensesCount}</div>
        <div className="text-xs text-muted-foreground mt-1">Expenses</div>
      </div>

      <div className="rounded-2xl bg-card border border-white/5 p-5 transition-all duration-200 hover:border-primary/20">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold gradient-text">
          {formatCurrency(totalSpent)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Total Spent</div>
      </div>

      <div className="rounded-2xl bg-card border border-white/5 p-5 transition-all duration-200 hover:border-primary/20">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">
          {formatCurrency(perPerson)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Per Person (avg)</div>
      </div>
    </div>
  );
}
