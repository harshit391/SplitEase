"use client";

import { Trophy } from "lucide-react";
import type { SettlementResult } from "@/types";
import { formatCurrency } from "@/utils";

interface PersonSpendingGridProps {
  friends: string[];
  settlements: SettlementResult;
}

const AVATAR_COLORS = [
  { bg: "bg-sky-100 dark:bg-[#0A84FF]/15", text: "text-sky-700 dark:text-[#64D2FF]", ring: "ring-sky-200 dark:ring-[#0A84FF]/30" },
  { bg: "bg-orange-100 dark:bg-[#FF9500]/15", text: "text-orange-700 dark:text-[#FF9F0A]", ring: "ring-orange-200 dark:ring-[#FF9500]/30" },
  { bg: "bg-emerald-100 dark:bg-[#30D158]/15", text: "text-emerald-700 dark:text-[#30D158]", ring: "ring-emerald-200 dark:ring-[#30D158]/30" },
  { bg: "bg-purple-100 dark:bg-[#BF5AF2]/15", text: "text-purple-700 dark:text-[#BF5AF2]", ring: "ring-purple-200 dark:ring-[#BF5AF2]/30" },
];

export function PersonSpendingGrid({
  friends,
  settlements,
}: PersonSpendingGridProps) {
  const amounts = friends.map((f) => settlements.balances[f]?.owes || 0);
  const minAmount = Math.min(...amounts.filter((a) => a > 0));

  return (
    <div className="rounded-[28px] bg-card border-[1.5px] border-[#d4d4d8] dark:border-[rgba(255,255,255,0.1)] p-6">
      <h3 className="font-extrabold text-foreground tracking-tight mb-5">By Person</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {friends.map((f, index) => {
          const amountOwes = settlements.balances[f]?.owes || 0;
          const isMinSpender = amountOwes > 0 && amountOwes === minAmount;
          const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];

          return (
            <div
              key={f}
              className={`rounded-[22px] p-4 flex flex-col items-center gap-2 relative transition-all duration-200 ring-1 ${
                isMinSpender
                  ? "bg-amber-50 dark:bg-amber-500/10 ring-amber-200 dark:ring-amber-500/30"
                  : `bg-secondary/50 dark:bg-white/[0.03] ${colors.ring}`
              }`}
            >
              {isMinSpender && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-3.5 h-3.5 text-amber-950" />
                </div>
              )}
              <span className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-sm font-extrabold ${colors.text}`}>
                {f.charAt(0).toUpperCase()}
              </span>
              <span
                className="text-xs text-muted-foreground truncate w-full text-center font-semibold"
                title={f}
              >
                {f.length > 10 ? f.slice(0, 9) + "..." : f}
              </span>
              <span className="font-extrabold text-foreground">
                {formatCurrency(amountOwes)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
