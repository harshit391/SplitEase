"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsRepository } from "@/database";
import { tripKeys } from "@/features/trips/hooks/useTrips";
import type { ExpenseGroupCreate, ExpenseGroupUpdate } from "@/types";

export function useAddExpenseGroup(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExpenseGroupCreate) =>
      tripsRepository.addExpenseGroup(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useUpdateExpenseGroup(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseGroupId,
      updates,
    }: {
      expenseGroupId: string;
      updates: ExpenseGroupUpdate;
    }) => tripsRepository.updateExpenseGroup(tripId, expenseGroupId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useDeleteExpenseGroup(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseGroupId: string) =>
      tripsRepository.deleteExpenseGroup(tripId, expenseGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}
