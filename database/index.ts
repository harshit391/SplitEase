export { db } from "./db";
export type { LocalTrip } from "./db";
export { localRepository } from "./local.repository";
export { createSupabaseRepository } from "./supabase.repository";
export { createUnifiedRepository } from "./unified.repository";
export type { ITripsRepository } from "./repository.interface";

// Backward compatibility alias
export { localRepository as tripsRepository } from "./local.repository";
