"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Download,
  Edit,
  Receipt,
  TrendingUp,
  Share2,
  ClipboardList,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTrip, useUpdateTrip } from "@/features/trips/hooks/useTrips";
import {
  useAddExpenseGroup,
  useUpdateExpenseGroup,
  useDeleteExpenseGroup,
  useSplitExpenseGroup,
  useReplaceExpenseGroupFromTemplate,
} from "@/features/expenses/hooks/useExpenseGroups";
import {
  useAddItem,
  useUpdateItem,
  useDeleteItem,
  useMoveItem,
} from "@/features/items/hooks/useItems";
import { useUIStore } from "@/store";
import { EditTripDialog } from "@/features/trips/components";
import {
  AddExpenseGroupDialog,
  EditExpenseGroupDialog,
  ExpenseGroupCard,
  SplitExpenseGroupDialog,
} from "@/features/expenses/components";
import { AddItemDialog, EditItemDialog, ItemTable, MoveItemDialog } from "@/features/items/components";
import { SettlementsList } from "@/features/settlements/components";
import {
  SummaryTable,
  PersonExpenseCards,
  SpendingChart,
} from "@/features/summary/components";
import {
  calculateSettlements,
  calculateSubTopicPersonTotals,
  exportTripAsJSON,
  generateExpenseList,
  copyToClipboard,
} from "@/services";
import type { ExpenseGroup, ExpenseGroupUpdate, Item, ItemCreate } from "@/types";
import type { ParsedTemplate } from "@/services/template-parser";
import { UserMenu } from "@/components/user-menu";
import { SyncStatusBadge } from "@/components/sync-status-badge";
import { OfflineBanner } from "@/components/offline-banner";
import { ShareTripDialog } from "@/components/share-trip-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { useConfirm } from "@/components/confirm-dialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutHint } from "@/components/keyboard-shortcut-hint";
import { createClient } from "@/lib/supabase/client";

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { confirm } = useConfirm();

  const { data: trip, isLoading } = useTrip(tripId);
  const updateTrip = useUpdateTrip();
  const addExpenseGroup = useAddExpenseGroup(tripId);
  const updateExpenseGroup = useUpdateExpenseGroup(tripId);
  const deleteExpenseGroup = useDeleteExpenseGroup(tripId);
  const splitExpenseGroup = useSplitExpenseGroup(tripId);
  const replaceExpenseGroupFromTemplate = useReplaceExpenseGroupFromTemplate(tripId);
  const addItem = useAddItem(tripId);
  const updateItem = useUpdateItem(tripId);
  const deleteItem = useDeleteItem(tripId);
  const moveItem = useMoveItem(tripId);

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
  const [shareTripDialogOpen, setShareTripDialogOpen] = useState(false);
  const [moveItemDialogOpen, setMoveItemDialogOpen] = useState(false);
  const [splitExpenseGroupDialogOpen, setSplitExpenseGroupDialogOpen] = useState(false);
  const [splittingExpenseGroup, setSplittingExpenseGroup] = useState<ExpenseGroup | null>(null);
  const [copyListDialogOpen, setCopyListDialogOpen] = useState(false);
  const [copyListDate, setCopyListDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [copyListPerson, setCopyListPerson] = useState("");
  const [copyListSuccess, setCopyListSuccess] = useState(false);

  // Editing states
  const [editingExpenseGroup, setEditingExpenseGroup] = useState<ExpenseGroup | null>(null);
  const [activeExpenseGroupId, setActiveExpenseGroupId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [movingItem, setMovingItem] = useState<Item | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);

  useKeyboardShortcuts([
    { key: "?", shift: true, label: "?", description: "Shortcuts", action: () => router.push("/shortcuts") },
    { key: "e", label: "E", description: "Add expense", action: () => setAddExpenseGroupDialogOpen(true) },
    { key: "s", label: "S", description: "Share trip", action: () => setShareTripDialogOpen(true) },
    { key: "d", label: "D", description: "Export trip", action: () => { if (trip) exportTripAsJSON(trip); } },
    { key: "t", label: "T", description: "Edit trip", action: () => setEditTripDialogOpen(true) },
  ]);

  // Fetch public share code for WhatsApp copy
  useEffect(() => {
    const supabase = createClient();
    Promise.resolve(
      supabase
        .from("trip_shares")
        .select("share_code")
        .eq("trip_id", tripId)
        .eq("share_type", "public")
        .maybeSingle()
    )
      .then(({ data }) => setShareCode(data?.share_code ?? null))
      .catch(() => {});
  }, [tripId]);

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
        const { subTopicTotal, totalTax, totalDiscount } =
          calculateSubTopicPersonTotals(sub, trip.friends);
        return sum + subTopicTotal + totalTax - totalDiscount;
      }, 0);
  }, [trip, excludedExpenseGroups]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!trip) return null;

  const handleEditTrip = (data: { name: string; friends: string[]; defaultPayer?: string | null }) => {
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

  const handleQuickAddExpenseGroup = async (data: ParsedTemplate, templateText: string) => {
    try {
      const group = await addExpenseGroup.mutateAsync({ name: data.groupName });
      if (!group) return;

      for (const item of data.items) {
        await addItem.mutateAsync({ expenseGroupId: group.id, data: item });
      }

      const updates: ExpenseGroupUpdate = { templateText };
      if (data.tax) {
        updates.taxMode = data.tax.mode;
        updates.taxPercent = data.tax.percent;
        updates.taxValue = data.tax.value;
      }
      if (data.discount) {
        updates.discountMode = data.discount.mode;
        updates.discountPercent = data.discount.percent;
        updates.discountValue = data.discount.value;
      }
      await updateExpenseGroup.mutateAsync({
        expenseGroupId: group.id,
        updates,
      });

      setAddExpenseGroupDialogOpen(false);
    } catch {
      // Mutations handle their own error states via TanStack Query
    }
  };

  const handleEditExpenseGroup = (data: ExpenseGroupUpdate) => {
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

  const handleQuickEditExpenseGroup = async (data: ParsedTemplate, templateText: string) => {
    if (!editingExpenseGroup) return;
    try {
      const updates: ExpenseGroupUpdate = {
        name: data.groupName,
        taxMode: data.tax ? data.tax.mode : "percentage",
        taxPercent: data.tax ? data.tax.percent : 0,
        taxValue: data.tax ? data.tax.value : 0,
        discountMode: data.discount ? data.discount.mode : "percentage",
        discountPercent: data.discount ? data.discount.percent : 0,
        discountValue: data.discount ? data.discount.value : 0,
      };
      await replaceExpenseGroupFromTemplate.mutateAsync({
        expenseGroupId: editingExpenseGroup.id,
        templateText,
        items: data.items,
        updates,
      });
      setEditExpenseGroupDialogOpen(false);
      setEditingExpenseGroup(null);
    } catch {
      // Handled by TanStack Query
    }
  };

  const handleDeleteExpenseGroup = async (expenseGroupId: string) => {
    const yes = await confirm({ title: "Delete this expense group?", variant: "destructive", confirmText: "Delete" });
    if (yes) deleteExpenseGroup.mutate(expenseGroupId);
  };

  const handleAddItem = (
    data: {
      name: string;
      amount: number;
      paidBy: string;
      splitAmong: string[];
      taxPercent?: number;
      taxValue?: number;
      taxMode?: "percentage" | "value";
      discountPercent?: number;
      discountValue?: number;
      discountMode?: "percentage" | "value";
    },
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

  const handleQuickAddItems = async (items: ItemCreate[]) => {
    if (!activeExpenseGroupId) return;
    try {
      for (const item of items) {
        await addItem.mutateAsync({ expenseGroupId: activeExpenseGroupId, data: item });
      }
      setAddItemDialogOpen(false);
      setActiveExpenseGroupId(null);
    } catch {
      // Mutations handle their own error states via TanStack Query
    }
  };

  const handleEditItem = (data: {
    name: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
    taxPercent?: number;
    taxValue?: number;
    taxMode?: "percentage" | "value";
    discountPercent?: number;
    discountValue?: number;
    discountMode?: "percentage" | "value";
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

  const handleMoveItem = (targetExpenseGroupId: string) => {
    if (movingItem && activeExpenseGroupId) {
      moveItem.mutate(
        {
          sourceExpenseGroupId: activeExpenseGroupId,
          targetExpenseGroupId,
          itemId: movingItem.id,
        },
        {
          onSuccess: () => {
            setMoveItemDialogOpen(false);
            setMovingItem(null);
            setActiveExpenseGroupId(null);
          },
        }
      );
    }
  };

  const handleSplitExpenseGroup = (newGroupName: string, itemIds: string[]) => {
    if (splittingExpenseGroup) {
      splitExpenseGroup.mutate(
        {
          sourceExpenseGroupId: splittingExpenseGroup.id,
          newGroupName,
          itemIds,
        },
        {
          onSuccess: () => {
            setSplitExpenseGroupDialogOpen(false);
            setSplittingExpenseGroup(null);
          },
        }
      );
    }
  };

  const handleUpdateExpenseGroupInline = (
    expenseGroupId: string,
    updates: ExpenseGroupUpdate
  ) => {
    updateExpenseGroup.mutate({
      expenseGroupId,
      updates,
    });
  };

  const handleExportTrip = () => {
    exportTripAsJSON(trip);
  };

  const handleCopyExpenseList = async () => {
    const text = generateExpenseList(trip, copyListDate, copyListPerson);
    const success = await copyToClipboard(text);
    if (success) {
      setCopyListSuccess(true);
      setTimeout(() => {
        setCopyListSuccess(false);
        setCopyListDialogOpen(false);
      }, 1200);
    }
  };

  const handleUpdateGoogleSheetUrl = (url: string | null) => {
    updateTrip.mutate({
      id: tripId,
      updates: { googleSheetUrl: url },
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[180px] -top-[160px] h-[430px] w-[430px] rounded-full bg-sky-300/30 dark:bg-[#0A84FF]/12 blur-3xl" />
        <div className="absolute -right-[130px] top-[80px] h-[380px] w-[380px] rounded-full bg-emerald-300/20 dark:bg-[#30D158]/8 blur-3xl" />
      </div>

      <OfflineBanner />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Split Solve"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-extrabold text-foreground hidden sm:inline tracking-tight">Split Solve</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 dark:bg-white/[0.06] ring-1 ring-border">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm max-w-[150px] truncate">{trip.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShareTripDialogOpen(true)}
              title="Share Trip"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleExportTrip}
              title="Export This Trip"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                if (!copyListPerson && trip.friends.length > 0) setCopyListPerson(trip.friends[0]);
                setCopyListDialogOpen(true);
              }}
              title="Copy Expense List"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden md:inline">Copy List</span>
            </Button>
            <SyncStatusBadge />
            <ThemeToggle />
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setAddExpenseGroupDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-[20px] p-6 md:p-8"
          style={{
            background: isDark
              ? "linear-gradient(145deg, #131D34 0%, #0B0D10 100%)"
              : "linear-gradient(145deg, #1e3a5f 0%, #0f172a 100%)",
            border: isDark ? "1px solid rgba(255,255,255,.06)" : "1px solid rgba(255,255,255,.08)",
          }}
        >
          {/* Subtle radial accent */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(59,130,246,.12), transparent)" }} />

          <div className="relative">
            {/* Top row: Title + meta */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✈️</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{trip.name}</h1>
                </div>
                <p className="text-sm text-slate-400">
                  {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {" · "}
                  {trip.friends.length} Friends
                  {" · "}
                  {trip.subTopics.length} Expenses
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditTripDialogOpen(true)}
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,.05)" }}>
                <div className="text-2xl font-bold text-white">₹{grandTotal.toFixed(0)}</div>
                <div className="text-xs text-slate-400 mt-1">Total Spent</div>
              </div>
              <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,.05)" }}>
                <div className="text-2xl font-bold text-white">
                  ₹{trip.friends.length > 0 ? (grandTotal / trip.friends.length).toFixed(0) : 0}
                </div>
                <div className="text-xs text-slate-400 mt-1">Per Person</div>
              </div>
              <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,.05)" }}>
                <div className="text-2xl font-bold text-white">{trip.friends.length}</div>
                <div className="text-xs text-slate-400 mt-1">People</div>
              </div>
              {settlements && (
                <div className="rounded-[14px] p-4" style={{ background: settlements.settlements.length > 0 ? "rgba(251,191,36,.08)" : "rgba(52,211,153,.08)" }}>
                  <div className={`text-2xl font-bold ${settlements.settlements.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {settlements.settlements.length > 0 ? `₹${settlements.settlements.reduce((s, t) => s + t.amount, 0).toFixed(0)}` : "✓"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {settlements.settlements.length > 0 ? "Pending" : "Settled"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settlement + Chart: Side by side on desktop */}
        {trip.subTopics.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Settlement (primary — what users came for) */}
            {settlements && (
              <SettlementsList
                tripName={trip.name}
                settlementResult={settlements}
                shareUrl={shareCode ? `${window.location.origin}/shared/${shareCode}` : undefined}
              />
            )}

            {/* Chart */}
            <SpendingChart trip={trip} excludedExpenseGroups={excludedExpenseGroups} />
          </div>
        )}

        {/* Participants: Combined person view (replaces PersonSpendingGrid + PersonExpenseCards) */}
        {settlements && trip.subTopics.length > 0 && (
          <PersonExpenseCards trip={trip} settlements={settlements} />
        )}

        {/* Detailed Expense Table (expandable) */}
        {trip.subTopics.length > 0 && (
          <details className="group">
            <summary
              className="list-none cursor-pointer rounded-[20px] p-5 flex items-center justify-between"
              style={{
                background: isDark ? '#16181D' : '#FFFFFF',
                border: isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid #E8EAF1',
              }}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-foreground">Detailed Expense Table</span>
              </div>
              <span className="text-muted-foreground text-sm group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 rounded-[20px] p-6" style={{
              background: isDark ? '#16181D' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid #E8EAF1',
            }}>
              <SummaryTable
                trip={trip}
                excludedSubTopicIds={excludedExpenseGroups}
                onUpdateGoogleSheetUrl={handleUpdateGoogleSheetUrl}
              />
            </div>
          </details>
        )}

        {/* Expense Groups */}
        {trip.subTopics.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-card border border-border flex items-center justify-center shadow-soft-sm">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              No expenses yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Add your first expense group like &quot;McDonald&apos;s&quot;, &quot;Hotel&quot;, etc.
            </p>
            <Button
              onClick={() => setAddExpenseGroupDialogOpen(true)}
              variant="glow"
              className="rounded-full"
            >
              <Plus className="w-5 h-5" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#30D158]/15 ring-1 ring-emerald-200 dark:ring-[#30D158]/30 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-[#30D158]" />
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
                onSplit={expenseGroup.items.length >= 2 ? () => {
                  setSplittingExpenseGroup(expenseGroup);
                  setSplitExpenseGroupDialogOpen(true);
                } : undefined}
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
                  onUpdateExpenseGroup={(updates) =>
                    handleUpdateExpenseGroupInline(expenseGroup.id, updates)
                  }
                  onMoveItem={trip.subTopics.length >= 2 ? (item) => {
                    setActiveExpenseGroupId(expenseGroup.id);
                    setMovingItem(item);
                    setMoveItemDialogOpen(true);
                  } : undefined}
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
        friends={trip.friends}
        onQuickSubmit={handleQuickAddExpenseGroup}
      />

      {editingExpenseGroup && (
        <EditExpenseGroupDialog
          open={editExpenseGroupDialogOpen}
          onOpenChange={(open) => {
            setEditExpenseGroupDialogOpen(open);
            if (!open) setEditingExpenseGroup(null);
          }}
          expenseGroup={editingExpenseGroup}
          friends={trip.friends}
          onSubmit={handleEditExpenseGroup}
          onQuickEditSubmit={handleQuickEditExpenseGroup}
        />
      )}

      <AddItemDialog
        open={addItemDialogOpen}
        onOpenChange={(open) => {
          setAddItemDialogOpen(open);
          if (!open) setActiveExpenseGroupId(null);
        }}
        friends={trip.friends}
        defaultPayer={trip.defaultPayer}
        taxDiscountLevel={
          trip.subTopics.find((s) => s.id === activeExpenseGroupId)
            ?.taxDiscountLevel || "group"
        }
        onSubmit={handleAddItem}
        onQuickSubmit={handleQuickAddItems}
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
          taxDiscountLevel={
            trip.subTopics.find((s) => s.id === activeExpenseGroupId)
              ?.taxDiscountLevel || "group"
          }
          onSubmit={handleEditItem}
        />
      )}

      <ShareTripDialog
        open={shareTripDialogOpen}
        onOpenChange={setShareTripDialogOpen}
        tripId={tripId}
        tripName={trip.name}
      />

      {movingItem && (
        <MoveItemDialog
          open={moveItemDialogOpen}
          onOpenChange={(open) => {
            setMoveItemDialogOpen(open);
            if (!open) {
              setMovingItem(null);
              setActiveExpenseGroupId(null);
            }
          }}
          item={movingItem}
          sourceExpenseGroupId={activeExpenseGroupId || ""}
          expenseGroups={trip.subTopics}
          onSubmit={handleMoveItem}
        />
      )}

      {splittingExpenseGroup && (
        <SplitExpenseGroupDialog
          open={splitExpenseGroupDialogOpen}
          onOpenChange={(open) => {
            setSplitExpenseGroupDialogOpen(open);
            if (!open) setSplittingExpenseGroup(null);
          }}
          expenseGroup={splittingExpenseGroup}
          onSubmit={handleSplitExpenseGroup}
        />
      )}

      <Dialog open={copyListDialogOpen} onOpenChange={setCopyListDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Copy Expense List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="copy-list-person">
                Person
              </label>
              <select
                id="copy-list-person"
                value={copyListPerson}
                onChange={(e) => setCopyListPerson(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {trip.friends.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="copy-list-date">
                Date
              </label>
              <input
                id="copy-list-date"
                type="date"
                value={copyListDate}
                onChange={(e) => setCopyListDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {generateExpenseList(trip, copyListDate, copyListPerson) || "No expenses for this person"}
              </pre>
            </div>
            <Button
              className="w-full rounded-full"
              onClick={handleCopyExpenseList}
              disabled={!copyListPerson || trip.subTopics.length === 0}
            >
              {copyListSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <KeyboardShortcutHint />
    </div>
  );
}
