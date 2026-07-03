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
  IndianRupee,
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
  { bg: "bg-sky-50 dark:bg-[#0A84FF]/15", text: "text-sky-600 dark:text-[#64D2FF]", ring: "ring-sky-200 dark:ring-[#0A84FF]/30", accent: "text-[#007AFF] dark:text-[#64D2FF]" },
  { bg: "bg-emerald-50 dark:bg-[#30D158]/15", text: "text-emerald-600 dark:text-[#30D158]", ring: "ring-emerald-200 dark:ring-[#30D158]/30", accent: "text-[#34C759] dark:text-[#30D158]" },
  { bg: "bg-purple-50 dark:bg-[#BF5AF2]/15", text: "text-purple-600 dark:text-[#BF5AF2]", ring: "ring-purple-200 dark:ring-[#BF5AF2]/30", accent: "text-[#AF52DE] dark:text-[#BF5AF2]" },
  { bg: "bg-orange-50 dark:bg-[#FF9500]/15", text: "text-orange-600 dark:text-[#FF9F0A]", ring: "ring-orange-200 dark:ring-[#FF9500]/30", accent: "text-[#FF9500] dark:text-[#FF9F0A]" },
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
        <div className="group relative rounded-[28px] border border-border bg-card p-6 cursor-pointer transition-all duration-300 card-hover-glow dark:bg-white/[0.065]">
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
          <div className={`w-12 h-12 rounded-2xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center mb-6`}>
            <MapPin className={`w-5 h-5 ${colors.text}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-foreground mb-3 pr-8 tracking-tight">
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
            <div className="mb-5 rounded-2xl bg-secondary/60 dark:bg-black/25 p-4 ring-1 ring-border dark:ring-white/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Expenses</span>
                <span className={`font-extrabold text-sm ${colors.accent}`}>
                  ₹{grandTotal.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                <span>Per Person</span>
                <span className="font-extrabold text-sm text-foreground">
                  ₹{trip.friends.length > 0 ? (grandTotal / trip.friends.length).toFixed(0) : 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 py-4 px-4 rounded-2xl bg-secondary/60 dark:bg-black/25 ring-1 ring-border dark:ring-white/10 text-center">
              <span className="text-xs text-muted-foreground">
                No expenses added yet
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
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
