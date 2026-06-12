"use client";

import { useState } from "react";
import { ChevronDown, IndianRupee, User, CreditCard, Split } from "lucide-react";
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
    <div className="rounded-2xl bg-card border border-white/5 p-6">
      <h3 className="flex items-center gap-3 text-foreground text-sm font-semibold mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        Person-Wise Expenses
      </h3>

      <div className="space-y-3">
        {trip.friends.map((person) => {
          const balance = settlements.balances[person];
          const net = settlements.nets[person] || 0;
          const isExpanded = expandedPerson === person;
          const { paidFor, splitOn } = getPersonItems(person);

          return (
            <div
              key={person}
              className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpandedPerson(isExpanded ? null : person)}
              >
                <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {person.charAt(0).toUpperCase()}
                </span>

                <div className="flex-1 text-left min-w-0">
                  <span className="font-medium text-foreground text-sm truncate block">
                    {person}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>Paid: {formatCurrency(balance?.paid || 0)}</span>
                    <span>Owes: {formatCurrency(balance?.owes || 0)}</span>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold shrink-0 ${
                    net > 0.01
                      ? "text-emerald-400"
                      : net < -0.01
                      ? "text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {net > 0.01 ? "+" : ""}
                  {formatCurrency(Math.abs(net))}
                  {net > 0.01 && <span className="text-[10px] font-normal ml-1">gets back</span>}
                  {net < -0.01 && <span className="text-[10px] font-normal ml-1">to pay</span>}
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
                                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03]"
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
                                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03]"
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
