"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ExpenseGroup, Trip } from "@/types";
import { calculateSubTopicPersonTotals } from "@/services";
import { formatCurrency } from "@/utils";

interface ExpenseGroupCardProps {
  trip: Trip;
  expenseGroup: ExpenseGroup;
  isExpanded: boolean;
  isExcluded: boolean;
  onToggleExpand: () => void;
  onToggleExclude: () => void;
  onEdit: () => void;
  onAddItem: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

export function ExpenseGroupCard({
  trip,
  expenseGroup,
  isExpanded,
  isExcluded,
  onToggleExpand,
  onToggleExclude,
  onEdit,
  onAddItem,
  onDelete,
  children,
}: ExpenseGroupCardProps) {
  const { subTopicTotal, totalTax } = calculateSubTopicPersonTotals(
    expenseGroup,
    trip.friends
  );

  return (
    <Card
      className={`overflow-hidden transition-all shadow-soft rounded-xl ${
        isExcluded ? "border-border/50 opacity-60" : "border-border"
      }`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center border border-primary/20 flex-shrink-0">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={`font-medium text-sm truncate ${
                  isExcluded
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {expenseGroup.name}
              </h3>
              {isExcluded && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-medium flex-shrink-0">
                  Excluded
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenseGroup.items.length} items · {formatCurrency(subTopicTotal + totalTax)}
              {expenseGroup.taxPercent > 0 && (
                <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                  (+{expenseGroup.taxPercent}% tax)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${
              isExcluded
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExclude();
            }}
            title={
              isExcluded
                ? "Include in calculations"
                : "Exclude from calculations"
            }
          >
            {isExcluded ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit expense group"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onAddItem();
            }}
            title="Add item"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete expense group"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-1"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 bg-secondary/20">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
