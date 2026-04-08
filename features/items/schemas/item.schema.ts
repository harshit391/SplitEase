import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
  amount: z.number().positive("Amount must be greater than 0"),
  paidBy: z.string().min(1, "Please select who paid"),
  splitAmong: z.array(z.string()).min(1, "Select at least one person to split with"),
  taxPercent: z.number().min(0).max(100).optional(),
  taxValue: z.number().min(0).optional(),
  taxMode: z.enum(["percentage", "value"]).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountValue: z.number().min(0).optional(),
  discountMode: z.enum(["percentage", "value"]).optional(),
});

export const editItemSchema = createItemSchema;

export type CreateItemFormData = z.infer<typeof createItemSchema>;
export type EditItemFormData = z.infer<typeof editItemSchema>;
