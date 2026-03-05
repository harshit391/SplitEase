"use client";

import { Wallet, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SettlementResult } from "@/types";
import { formatCurrency } from "@/utils";

interface PersonSpendingGridProps {
  friends: string[];
  settlements: SettlementResult;
}

export function PersonSpendingGrid({
  friends,
  settlements,
}: PersonSpendingGridProps) {
  const amounts = friends.map((f) => settlements.balances[f]?.owes || 0);
  const minAmount = Math.min(...amounts.filter((a) => a > 0));

  return (
    <Card className="bg-card border border-border p-6 shadow-soft rounded-xl">
      <h3 className="flex items-center gap-2 text-foreground text-sm font-semibold mb-4">
        <Wallet className="w-4 h-4 text-primary" />
        Amount Spent by Each Person
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {friends.map((f) => {
          const amountOwes = settlements.balances[f]?.owes || 0;
          const isMinSpender = amountOwes > 0 && amountOwes === minAmount;

          return (
            <div
              key={f}
              className={`bg-secondary/30 border rounded-lg p-4 flex flex-col items-center gap-2 relative transition-all ${
                isMinSpender
                  ? "border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/20"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {isMinSpender && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-amber-950" />
                </div>
              )}
              <span className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary border border-primary/20">
                {f.charAt(0).toUpperCase()}
              </span>
              <span
                className="text-xs text-muted-foreground truncate w-full text-center font-medium"
                title={f}
              >
                {f.length > 10 ? f.slice(0, 9) + "…" : f}
              </span>
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(amountOwes)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
