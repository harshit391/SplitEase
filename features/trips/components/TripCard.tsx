"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trash2,
  Users,
  Receipt,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types";
import { staggerItem } from "@/lib/animations";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  savedView?: boolean;
  linkPrefix?: string;
}

const CARD_COLORS = [
  { iconBg: "bg-[#007AFF]", accent: "text-[#007AFF] dark:text-[#64D2FF]" },
  { iconBg: "bg-[#34C759]", accent: "text-[#34C759] dark:text-[#30D158]" },
  { iconBg: "bg-[#AF52DE]", accent: "text-[#AF52DE] dark:text-[#BF5AF2]" },
  { iconBg: "bg-[#FF9500]", accent: "text-[#FF9500] dark:text-[#FF9F0A]" },
];

export function TripCard({ trip, onDelete, savedView, linkPrefix }: TripCardProps) {
  const grandTotal = trip.subTopics.reduce((total, sub) => {
    const subTotal = sub.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subTotal * ((sub.taxPercent || 0) / 100);
    return total + subTotal + tax;
  }, 0);

  const colorIndex = trip.name.length % CARD_COLORS.length;
  const colors = CARD_COLORS[colorIndex];

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Delete this trip permanently?")) {
      onDelete(trip.id);
    }
  };

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className="hover-lift"
    >
      <Link href={linkPrefix ? `${linkPrefix}/${trip.shareCode || trip.id}` : `/${trip.id}`}>
        <div className="group relative rounded-[28px] border-[1.5px] border-[#d4d4d8] dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-white/[0.065] p-6 cursor-pointer transition-all duration-200 hover:border-[#a1a1aa] dark:hover:border-[rgba(255,255,255,0.2)]">
          {/* Delete button */}
          {!savedView && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDelete}
                className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-6 shadow-lg`}>
            <MapPin className="w-5 h-5 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-foreground mb-2 pr-8 tracking-tight">
            {trip.name}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {trip.friends.length} friends
            </span>
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              {trip.subTopics.length} expenses
            </span>
          </div>

          {/* Expense Summary */}
          {grandTotal > 0 ? (
            <div className="mb-5 rounded-2xl p-4" style={{ backgroundColor: '#0f172a' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Expenses</span>
                <span className={`font-extrabold text-sm ${colors.accent}`}>
                  ₹{grandTotal.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-slate-400">Per Person</span>
                <span className="font-extrabold text-sm text-white">
                  ₹{trip.friends.length > 0 ? (grandTotal / trip.friends.length).toFixed(0) : 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 py-4 px-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
              <span className="text-xs text-muted-foreground">
                No expenses added yet
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.createdAt).toLocaleDateString()}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
