"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";
import type { Trip } from "@/types";
import { calculateSubTopicPersonTotals } from "@/services";
import { formatCurrency } from "@/utils";

const COLORS = [
  "#007AFF", "#34C759", "#FF9500", "#AF52DE", "#FF2D55",
  "#5AC8FA", "#FFCC00", "#FF3B30", "#64D2FF", "#30D158",
];

interface SpendingChartProps {
  trip: Trip;
  excludedExpenseGroups: string[];
}

interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

function ChartWithLegend({ data }: { data: ChartEntry[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No expenses to display
      </p>
    );
  }

  return (
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
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  opacity={0.85}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                return (
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
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
        {data.map((entry) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <div key={entry.name} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
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
  );
}

export function SpendingChart({ trip, excludedExpenseGroups }: SpendingChartProps) {
  const hasTags = trip.subTopics.some((g) => g.tags?.length > 0);
  const [viewMode, setViewMode] = useState<"group" | "tag">("group");
  const [activeTab, setActiveTab] = useState<string>("all");

  const included = useMemo(
    () => trip.subTopics.filter((g) => !excludedExpenseGroups.includes(g.id)),
    [trip.subTopics, excludedExpenseGroups]
  );

  // Stable color assignment: each group gets a fixed color based on its position in trip.subTopics
  const groupColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    trip.subTopics.forEach((group, index) => {
      map[group.name] = COLORS[index % COLORS.length];
    });
    return map;
  }, [trip.subTopics]);

  const getColor = (name: string) => groupColorMap[name] || COLORS[0];

  const allData = useMemo((): ChartEntry[] => {
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
      // For tag view, assign colors by tag order (stable within session)
      return Object.entries(tagTotals)
        .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
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
          color: getColor(group.name),
        };
      })
      .filter((d) => d.value > 0);
  }, [included, trip.friends, viewMode, hasTags, getColor]);

  const personData = useMemo((): ChartEntry[] | null => {
    if (activeTab === "all") return null;

    const person = activeTab;
    return included
      .map((group) => {
        const { totals } = calculateSubTopicPersonTotals(group, trip.friends);
        return {
          name: group.name,
          value: totals[person] || 0,
          color: getColor(group.name),
        };
      })
      .filter((d) => d.value > 0);
  }, [activeTab, included, trip.friends, getColor]);

  const chartData = activeTab === "all" ? allData : (personData || []);

  if (allData.length === 0) return null;

  return (
    <div className="rounded-[28px] bg-card border-[1.5px] border-[#d4d4d8] dark:border-[rgba(255,255,255,0.1)] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-extrabold text-foreground tracking-tight">Spending Breakdown</h3>
        {hasTags && activeTab === "all" && (
          <div className="flex items-center gap-1 rounded-full bg-secondary/80 dark:bg-white/[0.06] p-1 ring-1 ring-border text-xs">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                viewMode === "group"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("group")}
            >
              By Group
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                viewMode === "tag"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("tag")}
            >
              By Tag
            </button>
          </div>
        )}
      </div>

      {/* Person Tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
            activeTab === "all"
              ? "bg-foreground text-background shadow-sm"
              : "bg-secondary/80 dark:bg-white/[0.06] text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        {trip.friends.map((friend) => (
          <button
            key={friend}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
              activeTab === friend
                ? "bg-foreground text-background shadow-sm"
                : "bg-secondary/80 dark:bg-white/[0.06] text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(friend)}
          >
            {friend}
          </button>
        ))}
      </div>

      <ChartWithLegend data={chartData} />
    </div>
  );
}
