"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";
import type { Trip } from "@/types";
import { calculateSubTopicPersonTotals } from "@/services";
import { formatCurrency } from "@/utils";

const COLORS = [
  "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16",
];

interface SpendingChartProps {
  trip: Trip;
  excludedExpenseGroups: string[];
}

export function SpendingChart({ trip, excludedExpenseGroups }: SpendingChartProps) {
  const hasTags = trip.subTopics.some((g) => g.tags?.length > 0);
  const [viewMode, setViewMode] = useState<"group" | "tag">("group");

  const data = useMemo(() => {
    const included = trip.subTopics.filter(
      (g) => !excludedExpenseGroups.includes(g.id)
    );

    if (viewMode === "tag" && hasTags) {
      const tagTotals: Record<string, number> = {};
      for (const group of included) {
        const { subTopicTotal, totalTax, totalDiscount } =
          calculateSubTopicPersonTotals(group, trip.friends);
        const total = subTopicTotal + totalTax - totalDiscount;

        const groupTags = group.tags?.length > 0 ? group.tags : ["Uncategorized"];
        const perTag = total / groupTags.length;
        for (const tag of groupTags) {
          tagTotals[tag] = (tagTotals[tag] || 0) + perTag;
        }
      }
      return Object.entries(tagTotals)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value);
    }

    return included
      .map((group) => {
        const { subTopicTotal, totalTax, totalDiscount } =
          calculateSubTopicPersonTotals(group, trip.friends);
        return {
          name: group.name,
          value: subTopicTotal + totalTax - totalDiscount,
        };
      })
      .filter((d) => d.value > 0);
  }, [trip, excludedExpenseGroups, viewMode, hasTags]);

  if (data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl bg-card border border-white/5 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center gap-3 text-foreground text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-primary" />
          </div>
          Spending Breakdown
        </h3>
        {hasTags && (
          <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
            <button
              type="button"
              className={`px-3 py-1.5 font-medium transition-colors ${
                viewMode === "group"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("group")}
            >
              By Group
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 font-medium transition-colors ${
                viewMode === "tag"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("tag")}
            >
              By Tag
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-[200px] h-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    opacity={0.85}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="bg-card border border-white/10 rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs text-foreground font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.value as number)}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {data.map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            return (
              <div key={entry.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-foreground flex-1 truncate">
                  {entry.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {percentage}%
                </span>
                <span className="text-sm font-medium text-foreground shrink-0">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
