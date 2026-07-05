"use client";

import { useState } from "react";
import { ChevronDown, IndianRupee, CreditCard, Split } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trip, SettlementResult } from "@/types";
import { formatCurrency } from "@/utils";
import { useTheme } from "@/components/theme-provider";

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
  { color: "#2563EB", bg: "rgba(37,99,235,.08)", bgDark: "rgba(59,130,246,.12)" },
  { color: "#8B5CF6", bg: "rgba(139,92,246,.08)", bgDark: "rgba(139,92,246,.12)" },
  { color: "#FF9500", bg: "rgba(255,149,0,.08)", bgDark: "rgba(255,149,0,.12)" },
  { color: "#34C759", bg: "rgba(52,199,89,.08)", bgDark: "rgba(52,199,89,.12)" },
];

export function PersonExpenseCards({ trip, settlements }: PersonExpenseCardsProps) {
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const getPersonItems = (person: string) => {
    const paidFor: PersonItemInfo[] = [];
    const splitOn: PersonItemInfo[] = [];

    for (const group of trip.subTopics) {
      for (const item of group.items) {
        if (item.paidBy === person) {
          paidFor.push({ name: item.name, amount: item.amount, groupName: group.name });
        }
        if (item.splitAmong.includes(person)) {
          const share = item.splitAmong.length > 0 ? item.amount / item.splitAmong.length : 0;
          splitOn.push({ name: item.name, amount: item.amount, groupName: group.name, share });
        }
      }
    }
    return { paidFor, splitOn };
  };

  return (
    <div>
      <h3
        className="font-bold text-foreground tracking-tight mb-5"
        style={{ fontSize: 18 }}
      >
        Members
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {trip.friends.map((person, index) => {
          const balance = settlements.balances[person];
          const net = settlements.nets[person] || 0;
          const isExpanded = expandedPerson === person;
          const { paidFor, splitOn } = getPersonItems(person);
          const accent = PERSON_COLORS[index % PERSON_COLORS.length];

          return (
            <div
              key={person}
              className="rounded-[20px] overflow-hidden transition-all duration-200"
              style={{
                background: isDark ? "#16181D" : "#FFFFFF",
                border: isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid #E8EAF1",
              }}
            >
              <button
                type="button"
                className="w-full text-left p-5 transition-colors"
                onClick={() => setExpandedPerson(isExpanded ? null : person)}
                style={{ background: isExpanded ? (isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.01)") : "transparent" }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                    style={{
                      background: isDark ? accent.bgDark : accent.bg,
                      color: accent.color,
                    }}
                  >
                    {person.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + net */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground truncate" style={{ fontSize: 16 }}>
                        {person}
                      </span>
                      <span
                        className="text-sm font-bold shrink-0"
                        style={{
                          color: net > 0.01 ? "#34C759" : net < -0.01 ? "#EF4444" : (isDark ? "#9CA3AF" : "#64748B"),
                        }}
                      >
                        {net > 0.01 ? `+${formatCurrency(net)}` : net < -0.01 ? `-${formatCurrency(Math.abs(net))}` : "Settled"}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2" style={{ fontSize: 13, color: isDark ? "#9CA3AF" : "#64748B" }}>
                      <span>Paid {formatCurrency(balance?.paid || 0)}</span>
                      <span>·</span>
                      <span>Owes {formatCurrency(balance?.owes || 0)}</span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-3 h-[4px] rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,.06)" : "#E8EAF1" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${balance?.paid && (balance.paid + Math.abs(net)) > 0 ? Math.min(100, (balance.paid / (balance.paid + Math.abs(net))) * 100) : 50}%`,
                          background: accent.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>

                  <ChevronDown
                    className="w-4 h-4 shrink-0 transition-transform duration-200 mt-1"
                    style={{
                      color: isDark ? "#9CA3AF" : "#64748B",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </div>
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
                    <div className="px-5 pb-5 space-y-4" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,.05)" : "1px solid #F1F5F9" }}>
                      <div className="pt-4" />
                      {paidFor.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: isDark ? "#9CA3AF" : "#64748B" }}>
                            <CreditCard className="w-3.5 h-3.5" />
                            Paid For ({paidFor.length})
                          </h4>
                          <div className="space-y-1.5">
                            {paidFor.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between py-2 px-3 rounded-[12px]"
                                style={{ background: isDark ? "rgba(255,255,255,.03)" : "#F8FAFC" }}
                              >
                                <div className="min-w-0">
                                  <span className="text-sm text-foreground truncate block">{item.name}</span>
                                  <span style={{ fontSize: 11, color: isDark ? "#6B7280" : "#94A3B8" }}>{item.groupName}</span>
                                </div>
                                <span className="text-sm font-medium text-foreground shrink-0 flex items-center gap-0.5">
                                  <IndianRupee className="w-3 h-3" style={{ color: isDark ? "#6B7280" : "#94A3B8" }} />
                                  {item.amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {splitOn.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: isDark ? "#9CA3AF" : "#64748B" }}>
                            <Split className="w-3.5 h-3.5" />
                            Split On ({splitOn.length})
                          </h4>
                          <div className="space-y-1.5">
                            {splitOn.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between py-2 px-3 rounded-[12px]"
                                style={{ background: isDark ? "rgba(255,255,255,.03)" : "#F8FAFC" }}
                              >
                                <div className="min-w-0">
                                  <span className="text-sm text-foreground truncate block">{item.name}</span>
                                  <span style={{ fontSize: 11, color: isDark ? "#6B7280" : "#94A3B8" }}>{item.groupName}</span>
                                </div>
                                <span className="text-sm font-medium text-foreground shrink-0 flex items-center gap-0.5">
                                  <IndianRupee className="w-3 h-3" style={{ color: isDark ? "#6B7280" : "#94A3B8" }} />
                                  {(item.share || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {paidFor.length === 0 && splitOn.length === 0 && (
                        <p className="text-sm text-center py-2" style={{ color: isDark ? "#6B7280" : "#94A3B8" }}>
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
