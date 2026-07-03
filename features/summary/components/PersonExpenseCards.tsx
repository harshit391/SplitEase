"use client";

import { useState } from "react";
import { ChevronDown, IndianRupee, CreditCard, Split } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trip, SettlementResult } from "@/types";
import { formatCurrency } from "@/utils";

interface PersonExpenseCardsProps {
  trip: Trip;
  settlements: SettlementResult;
}

interface PersonItemInfo {
  name: string;
  amount: number;
  groupName: string;
  share?: number;
}

const PERSON_COLORS = [
  { bg: "bg-sky-100 dark:bg-[#0A84FF]/15", text: "text-sky-700 dark:text-[#64D2FF]" },
  { bg: "bg-emerald-100 dark:bg-[#30D158]/15", text: "text-emerald-700 dark:text-[#30D158]" },
  { bg: "bg-orange-100 dark:bg-[#FF9500]/15", text: "text-orange-700 dark:text-[#FF9F0A]" },
  { bg: "bg-purple-100 dark:bg-[#BF5AF2]/15", text: "text-purple-700 dark:text-[#BF5AF2]" },
];

export function PersonExpenseCards({ trip, settlements }: PersonExpenseCardsProps) {
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const getPersonItems = (person: string) => {
    const paidFor: PersonItemInfo[] = [];
    const splitOn: PersonItemInfo[] = [];

    for (const group of trip.subTopics) {
      for (const item of group.items) {
        if (item.paidBy === person) {
          paidFor.push({
            name: item.name,
            amount: item.amount,
            groupName: group.name,
          });
        }
        if (item.splitAmong.includes(person)) {
          const share = item.splitAmong.length > 0
            ? item.amount / item.splitAmong.length
            : 0;
          splitOn.push({
            name: item.name,
            amount: item.amount,
            groupName: group.name,
            share,
          });
        }
      }
    }

    return { paidFor, splitOn };
  };

  return (
    <div className="rounded-[28px] bg-card border border-slate-200/80 dark:border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-extrabold text-foreground tracking-tight">Person-wise Expenses</h3>
      </div>

      <div className="space-y-3">
        {trip.friends.map((person, index) => {
          const balance = settlements.balances[person];
          const net = settlements.nets[person] || 0;
          const isExpanded = expandedPerson === person;
          const { paidFor, splitOn } = getPersonItems(person);
          const colors = PERSON_COLORS[index % PERSON_COLORS.length];

          return (
            <div
              key={person}
              className="rounded-2xl bg-secondary/50 dark:bg-white/[0.03] ring-1 ring-border overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 hover:bg-secondary/80 dark:hover:bg-white/[0.04] transition-colors"
                onClick={() => setExpandedPerson(isExpanded ? null : person)}
              >
                <span className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-sm font-extrabold ${colors.text} shrink-0`}>
                  {person.charAt(0).toUpperCase()}
                </span>

                <div className="flex-1 text-left min-w-0">
                  <span className="font-extrabold text-foreground text-sm truncate block">
                    {person}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>Paid {formatCurrency(balance?.paid || 0)}</span>
                    <span>·</span>
                    <span>Owes {formatCurrency(balance?.owes || 0)}</span>
                  </div>
                </div>

                <span
                  className={`text-sm font-extrabold shrink-0 ${
                    net > 0.01
                      ? "text-emerald-600 dark:text-emerald-400"
                      : net < -0.01
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {net > 0.01 && formatCurrency(Math.abs(net)) + " gets back"}
                  {net < -0.01 && formatCurrency(Math.abs(net)) + " to pay"}
                  {Math.abs(net) <= 0.01 && "Settled"}
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {paidFor.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            <CreditCard className="w-3.5 h-3.5" />
                            Paid For ({paidFor.length})
                          </h4>
                          <div className="space-y-1.5">
                            {paidFor.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-background/50 dark:bg-white/[0.03]"
                              >
                                <div className="min-w-0">
                                  <span className="text-sm text-foreground truncate block">
                                    {item.name}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {item.groupName}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-foreground shrink-0 flex items-center gap-0.5">
                                  <IndianRupee className="w-3 h-3 text-muted-foreground" />
                                  {item.amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {splitOn.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            <Split className="w-3.5 h-3.5" />
                            Split On ({splitOn.length})
                          </h4>
                          <div className="space-y-1.5">
                            {splitOn.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-background/50 dark:bg-white/[0.03]"
                              >
                                <div className="min-w-0">
                                  <span className="text-sm text-foreground truncate block">
                                    {item.name}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {item.groupName}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-foreground shrink-0 flex items-center gap-0.5">
                                  <IndianRupee className="w-3 h-3 text-muted-foreground" />
                                  {(item.share || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {paidFor.length === 0 && splitOn.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No expenses yet
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
