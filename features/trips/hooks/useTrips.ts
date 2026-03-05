"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsRepository } from "@/database";
import type { TripCreate, TripUpdate, Trip } from "@/types";

export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export function useTrips() {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: () => tripsRepository.getAll(),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => tripsRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TripCreate) => tripsRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TripUpdate }) =>
      tripsRepository.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(id) });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tripsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useImportTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trip: Trip) => tripsRepository.import(trip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
