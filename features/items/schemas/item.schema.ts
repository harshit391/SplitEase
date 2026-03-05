import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
  amount: z.number().positive("Amount must be greater than 0"),
  paidBy: z.string().min(1, "Please select who paid"),
  splitAmong: z.array(z.string()).min(1, "Select at least one person to split with"),
});

export const editItemSchema = createItemSchema;

export type CreateItemFormData = z.infer<typeof createItemSchema>;
export type EditItemFormData = z.infer<typeof editItemSchema>;
