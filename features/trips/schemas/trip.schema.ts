import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100, "Trip name is too long"),
  friends: z
    .array(z.string().min(1, "Friend name cannot be empty"))
    .min(2, "Add at least 2 friends"),
});

export const editTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100, "Trip name is too long"),
  friends: z
    .array(z.string().min(1, "Friend name cannot be empty"))
    .min(1, "At least one person is required"),
});

export type CreateTripFormData = z.infer<typeof createTripSchema>;
export type EditTripFormData = z.infer<typeof editTripSchema>;
