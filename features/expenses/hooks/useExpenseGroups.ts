"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@/hooks/useRepository";
import { tripKeys } from "@/features/trips/hooks/useTrips";
import type { ExpenseGroupCreate, ExpenseGroupUpdate } from "@/types";

export function useAddExpenseGroup(tripId: string) {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: (data: ExpenseGroupCreate) =>
      repository.addExpenseGroup(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useUpdateExpenseGroup(tripId: string) {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: ({
      expenseGroupId,
      updates,
    }: {
      expenseGroupId: string;
      updates: ExpenseGroupUpdate;
    }) => repository.updateExpenseGroup(tripId, expenseGroupId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useDeleteExpenseGroup(tripId: string) {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: (expenseGroupId: string) =>
      repository.deleteExpenseGroup(tripId, expenseGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}
