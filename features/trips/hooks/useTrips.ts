"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@/hooks/useRepository";
import type { TripCreate, TripUpdate, Trip } from "@/types";

export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export function useTrips() {
  const repository = useRepository();

  return useQuery({
    queryKey: tripKeys.all,
    queryFn: () => repository.getAll(),
  });
}

export function useTrip(id: string) {
  const repository = useRepository();

  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: (data: TripCreate) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TripUpdate }) =>
      repository.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(id) });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useImportTrip() {
  const queryClient = useQueryClient();
  const repository = useRepository();

  return useMutation({
    mutationFn: (trip: Trip) => repository.import(trip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
