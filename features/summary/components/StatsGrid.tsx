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
      <div className="rounded-[24px] bg-card [border:1.5px_solid_#c4c4c8] dark:[border:1.5px_solid_rgba(255,255,255,0.1)] p-5 transition-all duration-200">
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 dark:bg-[#0A84FF]/15 text-sky-600 dark:text-[#64D2FF]">
          <Users className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-foreground tracking-tight">{friendsCount}</div>
        <div className="text-xs font-medium text-muted-foreground mt-1">Friends</div>
      </div>

      <div className="rounded-[24px] bg-card [border:1.5px_solid_#c4c4c8] dark:[border:1.5px_solid_rgba(255,255,255,0.1)] p-5 transition-all duration-200">
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 dark:bg-[#30D158]/15 text-emerald-600 dark:text-[#30D158]">
          <Receipt className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-foreground tracking-tight">{expensesCount}</div>
        <div className="text-xs font-medium text-muted-foreground mt-1">Expenses</div>
      </div>

      <div className="col-span-2 rounded-[24px] bg-[#0f172a] dark:bg-card p-5 text-white dark:text-foreground border border-[#0f172a] dark:border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 dark:text-muted-foreground">Total Spent</p>
          <TrendingUp className="w-4 h-4 text-emerald-400 dark:text-[#30D158]" />
        </div>
        <div className="mt-5 text-3xl font-extrabold tracking-tight">
          {formatCurrency(totalSpent)}
        </div>
        <div className="text-xs font-medium text-slate-400 dark:text-muted-foreground mt-1">
          {formatCurrency(perPerson)} per person
        </div>
      </div>
    </div>
  );
}
