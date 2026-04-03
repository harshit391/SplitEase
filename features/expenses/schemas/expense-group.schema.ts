import { z } from "zod";

export const createExpenseGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Expense group name is required")
    .max(100, "Name is too long"),
});

export const editExpenseGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Expense group name is required")
    .max(100, "Name is too long"),
  taxPercent: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) || 0 : val),
    z.number().min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%")
  ),
  taxValue: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) || 0 : val),
    z.number().min(0, "Tax value cannot be negative")
  ),
  discountPercent: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) || 0 : val),
    z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%")
  ),
  discountValue: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) || 0 : val),
    z.number().min(0, "Discount value cannot be negative")
  ),
});

export type CreateExpenseGroupFormData = z.infer<typeof createExpenseGroupSchema>;
export type EditExpenseGroupFormData = z.infer<typeof editExpenseGroupSchema>;
