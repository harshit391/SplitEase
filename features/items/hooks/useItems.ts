"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsRepository } from "@/database";
import { tripKeys } from "@/features/trips/hooks/useTrips";
import type { ItemCreate, ItemUpdate } from "@/types";

export function useAddItem(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseGroupId,
      data,
    }: {
      expenseGroupId: string;
      data: ItemCreate;
    }) => tripsRepository.addItem(tripId, expenseGroupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useUpdateItem(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseGroupId,
      itemId,
      updates,
    }: {
      expenseGroupId: string;
      itemId: string;
      updates: ItemUpdate;
    }) => tripsRepository.updateItem(tripId, expenseGroupId, itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useDeleteItem(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseGroupId,
      itemId,
    }: {
      expenseGroupId: string;
      itemId: string;
    }) => tripsRepository.deleteItem(tripId, expenseGroupId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}
