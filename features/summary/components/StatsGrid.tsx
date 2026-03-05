"use client";

import { Users, Receipt, TrendingUp, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      <Card className="bg-card border border-border p-5 shadow-soft rounded-xl">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Users className="w-4 h-4 text-primary" />
          Friends
        </div>
        <div className="text-2xl font-bold text-foreground">{friendsCount}</div>
      </Card>

      <Card className="bg-card border border-border p-5 shadow-soft rounded-xl">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Receipt className="w-4 h-4 text-primary" />
          Expenses
        </div>
        <div className="text-2xl font-bold text-foreground">{expensesCount}</div>
      </Card>

      <Card className="bg-card border border-border p-5 shadow-soft rounded-xl">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Total Spent
        </div>
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(totalSpent)}
        </div>
      </Card>

      <Card className="bg-card border border-border p-5 shadow-soft rounded-xl">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Calculator className="w-4 h-4 text-primary" />
          Per Person (avg)
        </div>
        <div className="text-2xl font-bold text-foreground">
          {formatCurrency(perPerson)}
        </div>
      </Card>
    </div>
  );
}
