"use client";

import { useState } from "react";
import {
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  Info,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SettlementResult } from "@/types";
import { formatSettlementsForWhatsApp, copyToClipboard } from "@/services";
import { formatCurrency } from "@/utils";

interface SettlementsListProps {
  tripName: string;
  settlementResult: SettlementResult;
}

export function SettlementsList({
  tripName,
  settlementResult,
}: SettlementsListProps) {
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const { balances, nets, settlements, steps } = settlementResult;

  const handleCopy = async () => {
    const text = `*Settlements (${tripName})*\n\n${formatSettlementsForWhatsApp(settlements)}`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Separate debtors and creditors for display
  const sortedPeople = Object.entries(nets).sort((a, b) => a[1] - b[1]);
  const hasTransactions = settlements.length > 0;

  if (!hasTransactions && Object.keys(balances).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Net Balance Table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
            <Info className="w-5 h-5 text-primary" />
          </div>
          Net Balance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Person
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Paid
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Should Pay
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Net
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPeople.map(([person, net]) => {
                const balance = balances[person];
                const isDebtor = net < -0.01;
                const isCreditor = net > 0.01;

                return (
                  <tr
                    key={person}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            isDebtor
                              ? "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 border border-red-500/30"
                              : isCreditor
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-secondary text-muted-foreground border border-border"
                          }`}
                        >
                          {person.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-foreground">
                          {person}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">
                      {formatCurrency(balance?.paid || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">
                      {formatCurrency(balance?.owes || 0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isDebtor && (
                          <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
                        )}
                        {isCreditor && (
                          <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        )}
                        <span
                          className={`font-mono font-semibold ${
                            isDebtor
                              ? "text-red-600 dark:text-red-400"
                              : isCreditor
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {isDebtor ? "-" : isCreditor ? "+" : ""}
                          {formatCurrency(Math.abs(net))}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground border border-border">
          <span className="text-red-600 dark:text-red-400 font-medium">Negative</span> = owes
          money |{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Positive</span> =
          should receive money
        </div>
      </div>

      {/* Section 2: Final Settlements */}
      {hasTransactions && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              Settlements
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-border hover:border-primary/30 hover:bg-accent"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy for WhatsApp
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-secondary/30 border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-10 h-10 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-sm font-semibold text-red-600 dark:text-red-400 border border-red-500/30">
                    {s.from.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-foreground font-medium">{s.from}</span>
                </div>

                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="px-4 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg">
                    <span className="text-primary font-bold">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-foreground font-medium">{s.to}</span>
                  <span className="w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {s.to.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Calculation Steps (Expandable) */}
          {steps.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setShowSteps(!showSteps)}
                className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  How were these settlements calculated?
                </span>
                {showSteps ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {showSteps && (
                <div className="mt-4 space-y-4">
                  {steps.map((step, index) => {
                    const isLastStep = index === steps.length - 1;

                    return (
                      <div
                        key={step.stepNumber}
                        className="bg-secondary/30 border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                            {step.stepNumber}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            Step {step.stepNumber}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground mb-3 space-y-1">
                          <p>
                            Largest debtor:{" "}
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {step.debtor}
                            </span>{" "}
                            (owes {formatCurrency(step.debtorAmount)})
                          </p>
                          <p>
                            Largest creditor:{" "}
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {step.creditor}
                            </span>{" "}
                            (should receive{" "}
                            {formatCurrency(step.creditorAmount)})
                          </p>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                          <span className="text-foreground">
                            <span className="font-medium">{step.debtor}</span>{" "}
                            pays{" "}
                            <span className="font-medium">{step.creditor}</span>{" "}
                            ={" "}
                            <span className="text-primary font-bold">
                              {formatCurrency(step.settlementAmount)}
                            </span>
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <p className="mb-2 font-medium">
                            Balances after this step:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {Object.entries(step.balancesAfter)
                              .sort((a, b) => a[1] - b[1])
                              .map(([person, balance]) => (
                                <div
                                  key={person}
                                  className="flex items-center justify-between bg-card border border-border rounded px-2 py-1"
                                >
                                  <span>{person}</span>
                                  <span
                                    className={`font-mono ${
                                      Math.abs(balance) < 0.01
                                        ? "text-muted-foreground"
                                        : balance < 0
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {Math.abs(balance) < 0.01
                                      ? "0"
                                      : balance < 0
                                        ? `-${formatCurrency(Math.abs(balance))}`
                                        : `+${formatCurrency(balance)}`}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {isLastStep && (
                          <div className="mt-3 p-2 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                              All balances settled!
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
