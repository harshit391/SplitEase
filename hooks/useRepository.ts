"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { createUnifiedRepository } from "@/database/unified.repository";
import type { ITripsRepository } from "@/database/repository.interface";

export function useRepository(): ITripsRepository {
  const { user } = useAuth();

  return useMemo(
    () => createUnifiedRepository(user?.id ?? null),
    [user?.id]
  );
}
