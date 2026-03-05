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
}

export function TripCard({ trip, onDelete }: TripCardProps) {
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
      <Link href={`/${trip.id}`}>
        <Card className="group relative bg-card border border-border hover:border-primary/40 p-6 cursor-pointer transition-all duration-200 shadow-soft rounded-xl">
          {/* Delete button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Icon */}
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
            <MapPin className="w-6 h-6 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">
            {trip.name}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
            <div className="mb-4 bg-secondary/50 dark:bg-secondary/30 border border-border rounded-lg divide-y divide-border">
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="text-sm font-semibold text-primary flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {grandTotal.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-muted-foreground">Per Person (avg)</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                  {trip.friends.length > 0 ? (grandTotal / trip.friends.length).toFixed(0) : 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-4 py-2.5 px-3 bg-secondary/50 border border-border rounded-lg text-center">
              <span className="text-sm text-muted-foreground">
                No expenses added yet
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.createdAt).toLocaleDateString()}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-200" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
