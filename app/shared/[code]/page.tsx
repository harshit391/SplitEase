"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Receipt,
  TrendingUp,
  Eye,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useUIStore } from "@/store";
import { ExpenseGroupCard } from "@/features/expenses/components";
import { ItemTable } from "@/features/items/components";
import { SettlementsList } from "@/features/settlements/components";
import {
  SummaryTable,
  StatsGrid,
  PersonSpendingGrid,
} from "@/features/summary/components";
import {
  calculateSettlements,
  calculateSubTopicPersonTotals,
} from "@/services";
import { createClient } from "@/lib/supabase/client";
import {
  createShareRepository,
  createSavedTripsRepository,
} from "@/database/supabase.repository";
import { useAuth } from "@/components/auth-provider";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types";

export default function SharedTripPage() {
  const params = useParams();
  const code = params.code as string;

  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);

  const {
    expandedExpenseGroups,
    excludedExpenseGroups,
    toggleExpandedExpenseGroup,
    toggleExcludedExpenseGroup,
  } = useUIStore();

  useEffect(() => {
    async function loadSharedTrip() {
      const supabase = createClient();
      const shareRepo = createShareRepository(supabase);
      const tripData = await shareRepo.getTripByShareCode(code);

      if (!tripData) {
        setError("Trip not found or link is no longer valid.");
      } else {
        setTrip(tripData);
        // Check if user has saved this trip
        if (user) {
          const savedRepo = createSavedTripsRepository(supabase, user.id);
          const saved = await savedRepo.isTripSaved(tripData.id);
          setIsSaved(saved);
        }
      }
      setLoading(false);
    }

    loadSharedTrip();
  }, [code, user]);

  const handleToggleSave = async () => {
    if (!trip || !user) return;
    setSavingTrip(true);
    const supabase = createClient();
    const savedRepo = createSavedTripsRepository(supabase, user.id);
    if (isSaved) {
      await savedRepo.unsaveTrip(trip.id);
      setIsSaved(false);
    } else {
      await savedRepo.saveTrip(trip.id);
      setIsSaved(true);
    }
    setSavingTrip(false);
  };

  const settlements = useMemo(() => {
    if (!trip) return null;
    return calculateSettlements(trip, excludedExpenseGroups);
  }, [trip, excludedExpenseGroups]);

  const grandTotal = useMemo(() => {
    if (!trip) return 0;
    return trip.subTopics
      .filter((sub) => !excludedExpenseGroups.includes(sub.id))
      .reduce((sum, sub) => {
        const { subTopicTotal, totalTax, totalDiscount } =
          calculateSubTopicPersonTotals(sub, trip.friends);
        return sum + subTopicTotal + totalTax - totalDiscount;
      }, 0);
  }, [trip, excludedExpenseGroups]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {error || "Trip not found"}
          </h2>
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Go to your trips
          </Link>
        </div>
      </div>
    );
  }

  const perPerson =
    trip.friends.length > 0 ? grandTotal / trip.friends.length : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="SplitEase"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-semibold text-foreground hidden sm:inline">
              SplitEase
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground text-sm">
                {trip.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-amber-400 font-medium">
                View Only
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSave}
              disabled={savingTrip}
              className={
                isSaved
                  ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                  : ""
              }
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaved ? "Saved" : "Save"}
              </span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 space-y-10">
        {/* Stats Row */}
        <StatsGrid
          friendsCount={trip.friends.length}
          expensesCount={trip.subTopics.length}
          totalSpent={grandTotal}
          perPerson={perPerson}
        />

        {/* Amount Spent by Each Person */}
        {settlements && (
          <PersonSpendingGrid
            friends={trip.friends}
            settlements={settlements}
          />
        )}

        {/* Summary Table */}
        {trip.subTopics.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              Overall Summary
            </h2>
            <SummaryTable
              trip={trip}
              excludedSubTopicIds={excludedExpenseGroups}
              onUpdateGoogleSheetUrl={() => {}}
            />
          </div>
        )}

        {/* Settlements */}
        {settlements && (
          <SettlementsList
            tripName={trip.name}
            settlementResult={settlements}
          />
        )}

        {/* Expense Groups (read-only) */}
        {trip.subTopics.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              Expense Groups
            </h2>
            {trip.subTopics.map((expenseGroup) => (
              <ExpenseGroupCard
                key={expenseGroup.id}
                trip={trip}
                expenseGroup={expenseGroup}
                isExpanded={expandedExpenseGroups.includes(expenseGroup.id)}
                isExcluded={excludedExpenseGroups.includes(expenseGroup.id)}
                onToggleExpand={() =>
                  toggleExpandedExpenseGroup(expenseGroup.id)
                }
                onToggleExclude={() =>
                  toggleExcludedExpenseGroup(expenseGroup.id)
                }
                onEdit={() => {}}
                onAddItem={() => {}}
                onDelete={() => {}}
                readOnly
              >
                <ItemTable
                  trip={trip}
                  expenseGroup={expenseGroup}
                  onAddItem={() => {}}
                  onEditItem={() => {}}
                  onDeleteItem={() => {}}
                  onUpdateExpenseGroup={() => {}}
                  readOnly
                />
              </ExpenseGroupCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
