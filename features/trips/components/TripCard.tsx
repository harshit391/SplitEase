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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types";
import { staggerItem } from "@/lib/animations";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  savedView?: boolean;
  linkPrefix?: string;
}

export function TripCard({ trip, onDelete, savedView, linkPrefix }: TripCardProps) {
  // Calculate grand total from all items
  const grandTotal = trip.subTopics.reduce((total, sub) => {
    const subTotal = sub.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subTotal * ((sub.taxPercent || 0) / 100);
    return total + subTotal + tax;
  }, 0);

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
        <Card className="group relative bg-card border border-white/5 hover:border-primary/30 p-6 cursor-pointer transition-all duration-300 card-hover-glow">
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
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <MapPin className="w-6 h-6 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-3 pr-8">
            {trip.name}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {trip.friends.length} friends
            </span>
            <span className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4" />
              {trip.subTopics.length} expenses
            </span>
          </div>

          {/* Expense Summary */}
          {grandTotal > 0 ? (
            <div className="mb-5 rounded-xl bg-white/[0.02] border border-white/5 divide-y divide-white/5">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="text-sm font-semibold text-primary flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {grandTotal.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">Per Person (avg)</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                  {trip.friends.length > 0 ? (grandTotal / trip.friends.length).toFixed(0) : 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-sm text-muted-foreground">
                No expenses added yet
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.createdAt).toLocaleDateString()}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-200 group-hover:translate-x-1" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
