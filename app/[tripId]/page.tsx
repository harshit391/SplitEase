"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Download,
  Edit,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTrip, useUpdateTrip } from "@/features/trips/hooks/useTrips";
import {
  useAddExpenseGroup,
  useUpdateExpenseGroup,
  useDeleteExpenseGroup,
} from "@/features/expenses/hooks/useExpenseGroups";
import {
  useAddItem,
  useUpdateItem,
  useDeleteItem,
} from "@/features/items/hooks/useItems";
import { useUIStore } from "@/store";
import { EditTripDialog } from "@/features/trips/components";
import {
  AddExpenseGroupDialog,
  EditExpenseGroupDialog,
  ExpenseGroupCard,
} from "@/features/expenses/components";
import { AddItemDialog, EditItemDialog, ItemTable } from "@/features/items/components";
import { SettlementsList } from "@/features/settlements/components";
import {
  SummaryTable,
  StatsGrid,
  PersonSpendingGrid,
} from "@/features/summary/components";
import {
  calculateSettlements,
  calculateSubTopicPersonTotals,
  exportTripAsJSON,
} from "@/services";
import type { ExpenseGroup, Item } from "@/types";

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const { data: trip, isLoading } = useTrip(tripId);
  const updateTrip = useUpdateTrip();
  const addExpenseGroup = useAddExpenseGroup(tripId);
  const updateExpenseGroup = useUpdateExpenseGroup(tripId);
  const deleteExpenseGroup = useDeleteExpenseGroup(tripId);
  const addItem = useAddItem(tripId);
  const updateItem = useUpdateItem(tripId);
  const deleteItem = useDeleteItem(tripId);

  const {
    expandedExpenseGroups,
    excludedExpenseGroups,
    toggleExpandedExpenseGroup,
    toggleExcludedExpenseGroup,
  } = useUIStore();

  // Dialog states
  const [editTripDialogOpen, setEditTripDialogOpen] = useState(false);
  const [addExpenseGroupDialogOpen, setAddExpenseGroupDialogOpen] = useState(false);
  const [editExpenseGroupDialogOpen, setEditExpenseGroupDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);

  // Editing states
  const [editingExpenseGroup, setEditingExpenseGroup] = useState<ExpenseGroup | null>(null);
  const [activeExpenseGroupId, setActiveExpenseGroupId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Redirect if trip not found
  useEffect(() => {
    if (!isLoading && !trip) {
      router.push("/");
    }
  }, [isLoading, trip, router]);

  // Calculate settlements
  const settlements = useMemo(() => {
    if (!trip) return null;
    return calculateSettlements(trip, excludedExpenseGroups);
  }, [trip, excludedExpenseGroups]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    if (!trip) return 0;
    return trip.subTopics
      .filter((sub) => !excludedExpenseGroups.includes(sub.id))
      .reduce((sum, sub) => {
        const { subTopicTotal, totalTax } = calculateSubTopicPersonTotals(
          sub,
          trip.friends
        );
        return sum + subTopicTotal + totalTax;
      }, 0);
  }, [trip, excludedExpenseGroups]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!trip) return null;

  const handleEditTrip = (data: { name: string; friends: string[] }) => {
    updateTrip.mutate(
      { id: tripId, updates: data },
      { onSuccess: () => setEditTripDialogOpen(false) }
    );
  };

  const handleAddExpenseGroup = (data: { name: string }) => {
    addExpenseGroup.mutate(data, {
      onSuccess: () => setAddExpenseGroupDialogOpen(false),
    });
  };

  const handleEditExpenseGroup = (data: { name: string; taxPercent: number }) => {
    if (editingExpenseGroup) {
      updateExpenseGroup.mutate(
        { expenseGroupId: editingExpenseGroup.id, updates: data },
        {
          onSuccess: () => {
            setEditExpenseGroupDialogOpen(false);
            setEditingExpenseGroup(null);
          },
        }
      );
    }
  };

  const handleDeleteExpenseGroup = (expenseGroupId: string) => {
    if (window.confirm("Delete this expense group?")) {
      deleteExpenseGroup.mutate(expenseGroupId);
    }
  };

  const handleAddItem = (
    data: { name: string; amount: number; paidBy: string; splitAmong: string[] },
    continueAdding: boolean
  ) => {
    if (activeExpenseGroupId) {
      addItem.mutate(
        { expenseGroupId: activeExpenseGroupId, data },
        {
          onSuccess: () => {
            if (!continueAdding) {
              setAddItemDialogOpen(false);
              setActiveExpenseGroupId(null);
            }
          },
        }
      );
    }
  };

  const handleEditItem = (data: {
    name: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
  }) => {
    if (editingItem && activeExpenseGroupId) {
      updateItem.mutate(
        {
          expenseGroupId: activeExpenseGroupId,
          itemId: editingItem.id,
          updates: data,
        },
        {
          onSuccess: () => {
            setEditItemDialogOpen(false);
            setEditingItem(null);
            setActiveExpenseGroupId(null);
          },
        }
      );
    }
  };

  const handleDeleteItem = (expenseGroupId: string, itemId: string) => {
    deleteItem.mutate({ expenseGroupId, itemId });
  };

  const handleUpdateTax = (expenseGroupId: string, taxPercent: number) => {
    updateExpenseGroup.mutate({
      expenseGroupId,
      updates: { taxPercent },
    });
  };

  const handleExportTrip = () => {
    exportTripAsJSON(trip);
  };

  const handleUpdateGoogleSheetUrl = (url: string | null) => {
    updateTrip.mutate({
      id: tripId,
      updates: { googleSheetUrl: url },
    });
  };

  const perPerson = trip.friends.length > 0 ? grandTotal / trip.friends.length : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="SplitEase"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-bold text-foreground hidden sm:inline">SplitEase</span>
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {trip.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditTripDialogOpen(true)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Edit trip details"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {trip.friends.length} friends · {trip.subTopics.length} expenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTrip}
              className="border-border hover:border-primary/30 hover:bg-accent"
              title="Export This Trip"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setAddExpenseGroupDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Expense</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Row */}
        <StatsGrid
          friendsCount={trip.friends.length}
          expensesCount={trip.subTopics.length}
          totalSpent={grandTotal}
          perPerson={perPerson}
        />

        {/* Amount Spent by Each Person */}
        {settlements && (
          <PersonSpendingGrid friends={trip.friends} settlements={settlements} />
        )}

        {/* Summary Table */}
        {trip.subTopics.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center border border-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              Overall Summary
            </h2>
            <SummaryTable
              trip={trip}
              excludedSubTopicIds={excludedExpenseGroups}
              onUpdateGoogleSheetUrl={handleUpdateGoogleSheetUrl}
            />
          </div>
        )}

        {/* Settlements */}
        {settlements && (
          <SettlementsList tripName={trip.name} settlementResult={settlements} />
        )}

        {/* Expense Groups */}
        {trip.subTopics.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center border border-border">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No expenses yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first expense group like &quot;McDonald&apos;s&quot;, &quot;Hotel&quot;, etc.
            </p>
            <Button
              onClick={() => setAddExpenseGroupDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
              <Receipt className="w-5 h-5 text-primary" />
              Expense Groups
            </h2>
            {trip.subTopics.map((expenseGroup) => (
              <ExpenseGroupCard
                key={expenseGroup.id}
                trip={trip}
                expenseGroup={expenseGroup}
                isExpanded={expandedExpenseGroups.includes(expenseGroup.id)}
                isExcluded={excludedExpenseGroups.includes(expenseGroup.id)}
                onToggleExpand={() => toggleExpandedExpenseGroup(expenseGroup.id)}
                onToggleExclude={() => toggleExcludedExpenseGroup(expenseGroup.id)}
                onEdit={() => {
                  setEditingExpenseGroup(expenseGroup);
                  setEditExpenseGroupDialogOpen(true);
                }}
                onAddItem={() => {
                  setActiveExpenseGroupId(expenseGroup.id);
                  setAddItemDialogOpen(true);
                }}
                onDelete={() => handleDeleteExpenseGroup(expenseGroup.id)}
              >
                <ItemTable
                  trip={trip}
                  expenseGroup={expenseGroup}
                  onAddItem={() => {
                    setActiveExpenseGroupId(expenseGroup.id);
                    setAddItemDialogOpen(true);
                  }}
                  onEditItem={(item) => {
                    setActiveExpenseGroupId(expenseGroup.id);
                    setEditingItem(item);
                    setEditItemDialogOpen(true);
                  }}
                  onDeleteItem={(itemId) => handleDeleteItem(expenseGroup.id, itemId)}
                  onUpdateTax={(taxPercent) => handleUpdateTax(expenseGroup.id, taxPercent)}
                />
              </ExpenseGroupCard>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditTripDialog
        open={editTripDialogOpen}
        onOpenChange={setEditTripDialogOpen}
        trip={trip}
        onSubmit={handleEditTrip}
      />

      <AddExpenseGroupDialog
        open={addExpenseGroupDialogOpen}
        onOpenChange={setAddExpenseGroupDialogOpen}
        onSubmit={handleAddExpenseGroup}
      />

      {editingExpenseGroup && (
        <EditExpenseGroupDialog
          open={editExpenseGroupDialogOpen}
          onOpenChange={(open) => {
            setEditExpenseGroupDialogOpen(open);
            if (!open) setEditingExpenseGroup(null);
          }}
          expenseGroup={editingExpenseGroup}
          onSubmit={handleEditExpenseGroup}
        />
      )}

      <AddItemDialog
        open={addItemDialogOpen}
        onOpenChange={(open) => {
          setAddItemDialogOpen(open);
          if (!open) setActiveExpenseGroupId(null);
        }}
        friends={trip.friends}
        onSubmit={handleAddItem}
      />

      {editingItem && (
        <EditItemDialog
          open={editItemDialogOpen}
          onOpenChange={(open) => {
            setEditItemDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              setActiveExpenseGroupId(null);
            }
          }}
          item={editingItem}
          friends={trip.friends}
          onSubmit={handleEditItem}
        />
      )}
    </div>
  );
}
