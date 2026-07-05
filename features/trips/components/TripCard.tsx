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
import { useTheme } from "@/components/theme-provider";
import { useConfirm } from "@/components/confirm-dialog";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  savedView?: boolean;
  linkPrefix?: string;
}

const ACCENT_PALETTE = [
  { color: "#FF9500", glow: "rgba(255,145,0,.12)" },
  { color: "#2563EB", glow: "rgba(60,120,255,.12)" },
  { color: "#34C759", glow: "rgba(0,220,130,.12)" },
  { color: "#8B5CF6", glow: "rgba(140,80,255,.12)" },
];

const LIGHT = {
  cardBg: "#FFFFFF",
  border: "1px solid #E8EAF1",
  shadow: "0 10px 40px rgba(20,20,40,.06)",
  hoverShadow: "0 20px 60px rgba(20,20,40,.12)",
  heading: "#0F172A",
  secondary: "#64748B",
  expenseBg: "linear-gradient(145deg, #FFFFFF, #F3F5F8)",
  progressTrack: "#E8EAF1",
  divider: "#E8EAF1",
  arrowBg: "#F1F5F9",
};

const DARK = {
  cardBg: "#16181D",
  border: "1px solid rgba(255,255,255,.08)",
  shadow: "0 12px 40px rgba(0,0,0,.45)",
  hoverShadow: "0 20px 60px rgba(0,0,0,.6)",
  heading: "#F8FAFC",
  secondary: "#9CA3AF",
  expenseBg: "linear-gradient(145deg, #18203A, #101728)",
  progressTrack: "rgba(255,255,255,.08)",
  divider: "rgba(255,255,255,.06)",
  arrowBg: "rgba(255,255,255,.06)",
};

export function TripCard({ trip, onDelete, savedView, linkPrefix }: TripCardProps) {
  const { confirm } = useConfirm();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const t = isDark ? DARK : LIGHT;

  const grandTotal = trip.subTopics.reduce((total, sub) => {
    const subTotal = sub.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subTotal * ((sub.taxPercent || 0) / 100);
    return total + subTotal + tax;
  }, 0);

  const accentIndex = trip.name.length % ACCENT_PALETTE.length;
  const accent = ACCENT_PALETTE[accentIndex];

  const status = trip.subTopics.length === 0 ? "New" : "Active";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const yes = await confirm({ title: "Delete this trip permanently?", variant: "destructive", confirmText: "Delete" });
    if (yes) onDelete(trip.id);
  };

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link href={linkPrefix ? `${linkPrefix}/${trip.shareCode || trip.id}` : `/${trip.id}`}>
        <div
          className="group relative overflow-hidden cursor-pointer"
          style={{
            borderRadius: 24,
            padding: 28,
            background: t.cardBg,
            border: t.border,
            boxShadow: t.shadow,
            transition: "box-shadow 250ms ease, border-color 250ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = t.hoverShadow;
            e.currentTarget.style.border = `1px solid ${accent.color}25`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = t.shadow;
            e.currentTarget.style.border = t.border;
          }}
        >
          {/* Ambient radial glow */}
          <div
            className="absolute top-0 left-0 w-[200px] h-[200px] pointer-events-none"
            style={{
              background: `radial-gradient(circle at top left, ${accent.glow}, transparent)`,
            }}
          />

          {/* Delete button */}
          {!savedView && (
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDelete}
                className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label="Delete trip"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Top: Icon + Status */}
          <div className="relative flex items-center gap-3 mb-5">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center w-11 h-11 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${accent.color}, ${accent.color}cc)`,
                boxShadow: `0 4px 14px ${accent.glow}`,
              }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </motion.div>

            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${accent.color}15`,
                color: accent.color,
              }}
            >
              {status}
            </span>
          </div>

          {/* Title */}
          <h3
            className="relative mb-3 pr-8"
            style={{ fontSize: 20, fontWeight: 600, color: t.heading, lineHeight: 1.3 }}
          >
            {trip.name}
          </h3>

          {/* Metadata */}
          <div
            className="relative flex items-center gap-1.5 mb-5 flex-wrap"
            style={{ fontSize: 14, fontWeight: 500, color: t.secondary }}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{trip.friends.length} Friends</span>
            <span className="mx-1 opacity-40">·</span>
            <Receipt className="w-3.5 h-3.5" />
            <span>{trip.subTopics.length} Expenses</span>
          </div>

          {/* Expense Summary Hero */}
          {grandTotal > 0 ? (
            <div
              className="relative rounded-[18px] p-5 mb-5"
              style={{ background: t.expenseBg }}
            >
              <div className="flex items-baseline justify-between">
                <span style={{ fontSize: 13, fontWeight: 500, color: t.secondary }}>
                  Total Expenses
                </span>
                <span style={{ fontSize: 30, fontWeight: 700, color: accent.color }}>
                  ₹{grandTotal.toFixed(0)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span style={{ fontSize: 13, fontWeight: 500, color: t.secondary }}>
                  Per Person
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: t.heading }}>
                  ₹{trip.friends.length > 0 ? (grandTotal / trip.friends.length).toFixed(0) : 0}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="relative rounded-[18px] p-5 mb-5 text-center"
              style={{ background: t.expenseBg }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: t.secondary }}>
                No expenses added yet
              </span>
            </div>
          )}


          {/* Footer */}
          <div
            className="relative flex items-center justify-between pt-4"
            style={{ borderTop: `1px solid ${t.divider}` }}
          >
            <span
              className="flex items-center gap-1.5"
              style={{ fontSize: 14, fontWeight: 500, color: t.secondary }}
            >
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.createdAt).toLocaleDateString()}
            </span>

            <div
              className="flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-250 group-hover:translate-x-1.5"
              style={{ backgroundColor: t.arrowBg }}
            >
              <ArrowRight className="w-4 h-4" style={{ color: t.secondary }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
