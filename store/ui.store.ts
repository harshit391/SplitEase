"use client";

import { create } from "zustand";

interface UIState {
  // Dialog states
  createTripDialogOpen: boolean;
  editTripDialogOpen: boolean;
  addExpenseGroupDialogOpen: boolean;
  editExpenseGroupDialogOpen: boolean;
  addItemDialogOpen: boolean;
  editItemDialogOpen: boolean;

  // Currently editing entities
  editingTripId: string | null;
  editingExpenseGroupId: string | null;
  editingItemId: string | null;
  activeExpenseGroupId: string | null;

  // Expanded expense groups (Set stored as array for serialization)
  expandedExpenseGroups: string[];
  excludedExpenseGroups: string[];

  // Actions
  openCreateTripDialog: () => void;
  closeCreateTripDialog: () => void;
  openEditTripDialog: (tripId: string) => void;
  closeEditTripDialog: () => void;
  openAddExpenseGroupDialog: () => void;
  closeAddExpenseGroupDialog: () => void;
  openEditExpenseGroupDialog: (expenseGroupId: string) => void;
  closeEditExpenseGroupDialog: () => void;
  openAddItemDialog: (expenseGroupId: string) => void;
  closeAddItemDialog: () => void;
  openEditItemDialog: (expenseGroupId: string, itemId: string) => void;
  closeEditItemDialog: () => void;
  toggleExpandedExpenseGroup: (id: string) => void;
  toggleExcludedExpenseGroup: (id: string) => void;
  resetExcludedExpenseGroups: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  createTripDialogOpen: false,
  editTripDialogOpen: false,
  addExpenseGroupDialogOpen: false,
  editExpenseGroupDialogOpen: false,
  addItemDialogOpen: false,
  editItemDialogOpen: false,
  editingTripId: null,
  editingExpenseGroupId: null,
  editingItemId: null,
  activeExpenseGroupId: null,
  expandedExpenseGroups: [],
  excludedExpenseGroups: [],

  // Dialog actions
  openCreateTripDialog: () => set({ createTripDialogOpen: true }),
  closeCreateTripDialog: () => set({ createTripDialogOpen: false }),

  openEditTripDialog: (tripId) =>
    set({ editTripDialogOpen: true, editingTripId: tripId }),
  closeEditTripDialog: () =>
    set({ editTripDialogOpen: false, editingTripId: null }),

  openAddExpenseGroupDialog: () => set({ addExpenseGroupDialogOpen: true }),
  closeAddExpenseGroupDialog: () => set({ addExpenseGroupDialogOpen: false }),

  openEditExpenseGroupDialog: (expenseGroupId) =>
    set({
      editExpenseGroupDialogOpen: true,
      editingExpenseGroupId: expenseGroupId,
    }),
  closeEditExpenseGroupDialog: () =>
    set({ editExpenseGroupDialogOpen: false, editingExpenseGroupId: null }),

  openAddItemDialog: (expenseGroupId) =>
    set({ addItemDialogOpen: true, activeExpenseGroupId: expenseGroupId }),
  closeAddItemDialog: () =>
    set({ addItemDialogOpen: false, activeExpenseGroupId: null }),

  openEditItemDialog: (expenseGroupId, itemId) =>
    set({
      editItemDialogOpen: true,
      activeExpenseGroupId: expenseGroupId,
      editingItemId: itemId,
    }),
  closeEditItemDialog: () =>
    set({
      editItemDialogOpen: false,
      activeExpenseGroupId: null,
      editingItemId: null,
    }),

  // Toggle actions
  toggleExpandedExpenseGroup: (id) =>
    set((state) => ({
      expandedExpenseGroups: state.expandedExpenseGroups.includes(id)
        ? state.expandedExpenseGroups.filter((gId) => gId !== id)
        : [...state.expandedExpenseGroups, id],
    })),

  toggleExcludedExpenseGroup: (id) =>
    set((state) => ({
      excludedExpenseGroups: state.excludedExpenseGroups.includes(id)
        ? state.excludedExpenseGroups.filter((gId) => gId !== id)
        : [...state.excludedExpenseGroups, id],
    })),

  resetExcludedExpenseGroups: () => set({ excludedExpenseGroups: [] }),
}));
