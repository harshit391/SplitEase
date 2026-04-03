"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Receipt, Percent, IndianRupee } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExpenseGroup, ExpenseGroupUpdate } from "@/types";

const editExpenseGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Expense group name is required")
    .max(100, "Name is too long"),
  taxPercent: z.number().min(0).max(100).optional(),
  taxValue: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountValue: z.number().min(0).optional(),
});

type FormData = z.infer<typeof editExpenseGroupSchema>;

interface EditExpenseGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseGroup: ExpenseGroup;
  onSubmit: (data: ExpenseGroupUpdate) => void;
}

export function EditExpenseGroupDialog({
  open,
  onOpenChange,
  expenseGroup,
  onSubmit,
}: EditExpenseGroupDialogProps) {
  const currentTaxMode = expenseGroup.taxMode || "percentage";
  const currentDiscountMode = expenseGroup.discountMode || "percentage";

  const [taxMode, setTaxMode] = useState<"percentage" | "value">(currentTaxMode);
  const [discountMode, setDiscountMode] = useState<"percentage" | "value">(currentDiscountMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(editExpenseGroupSchema),
    defaultValues: {
      name: expenseGroup.name,
      taxPercent: expenseGroup.taxPercent || 0,
      taxValue: expenseGroup.taxValue || 0,
      discountPercent: expenseGroup.discountPercent || 0,
      discountValue: expenseGroup.discountValue || 0,
    },
  });

  useEffect(() => {
    if (open) {
      const tMode = expenseGroup.taxMode || "percentage";
      const dMode = expenseGroup.discountMode || "percentage";
      setTaxMode(tMode);
      setDiscountMode(dMode);
      reset({
        name: expenseGroup.name,
        taxPercent: expenseGroup.taxPercent || 0,
        taxValue: expenseGroup.taxValue || 0,
        discountPercent: expenseGroup.discountPercent || 0,
        discountValue: expenseGroup.discountValue || 0,
      });
    }
  }, [open, expenseGroup, reset]);

  const handleFormSubmit = (data: FormData) => {
    const updates: ExpenseGroupUpdate = { name: data.name };

    if (taxMode === "percentage") {
      updates.taxPercent = data.taxPercent ?? 0;
      updates.taxMode = "percentage";
      updates.taxValue = 0;
    } else {
      updates.taxValue = data.taxValue ?? 0;
      updates.taxMode = "value";
      updates.taxPercent = 0;
    }

    if (discountMode === "percentage") {
      updates.discountPercent = data.discountPercent ?? 0;
      updates.discountMode = "percentage";
      updates.discountValue = 0;
    } else {
      updates.discountValue = data.discountValue ?? 0;
      updates.discountMode = "value";
      updates.discountPercent = 0;
    }

    onSubmit(updates);
  };

  const hasErrors = errors.name || errors.taxPercent || errors.taxValue || errors.discountPercent || errors.discountValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <DialogTitle>Edit Expense Group</DialogTitle>
          <DialogDescription>
            Update expense group name, tax, and discount
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {hasErrors && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errors.name?.message ||
                errors.taxPercent?.message ||
                errors.taxValue?.message ||
                errors.discountPercent?.message ||
                errors.discountValue?.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="editExpenseGroupName">Name</Label>
            <Input
              id="editExpenseGroupName"
              {...register("name")}
              placeholder="Expense group name"
            />
          </div>

          {/* Tax Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tax</Label>
              <div className="flex rounded-lg overflow-hidden border border-amber-500/30">
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    taxMode === "percentage"
                      ? "bg-amber-500 text-white"
                      : "bg-transparent text-amber-400 hover:bg-amber-500/20"
                  }`}
                  onClick={() => setTaxMode("percentage")}
                >
                  <Percent className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    taxMode === "value"
                      ? "bg-amber-500 text-white"
                      : "bg-transparent text-amber-400 hover:bg-amber-500/20"
                  }`}
                  onClick={() => setTaxMode("value")}
                >
                  <IndianRupee className="w-3 h-3" />
                </button>
              </div>
            </div>
            {taxMode === "percentage" ? (
              <Input
                type="number"
                {...register("taxPercent", { valueAsNumber: true })}
                placeholder="Tax percentage"
                min="0"
                max="100"
                step="0.1"
              />
            ) : (
              <Input
                type="number"
                {...register("taxValue", { valueAsNumber: true })}
                placeholder="Tax amount (₹)"
                min="0"
                step="0.01"
              />
            )}
          </div>

          {/* Discount Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Discount</Label>
              <div className="flex rounded-lg overflow-hidden border border-emerald-500/30">
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    discountMode === "percentage"
                      ? "bg-emerald-500 text-white"
                      : "bg-transparent text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                  onClick={() => setDiscountMode("percentage")}
                >
                  <Percent className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    discountMode === "value"
                      ? "bg-emerald-500 text-white"
                      : "bg-transparent text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                  onClick={() => setDiscountMode("value")}
                >
                  <IndianRupee className="w-3 h-3" />
                </button>
              </div>
            </div>
            {discountMode === "percentage" ? (
              <Input
                type="number"
                {...register("discountPercent", { valueAsNumber: true })}
                placeholder="Discount percentage"
                min="0"
                max="100"
                step="0.1"
              />
            ) : (
              <Input
                type="number"
                {...register("discountValue", { valueAsNumber: true })}
                placeholder="Discount amount (₹)"
                min="0"
                step="0.01"
              />
            )}
          </div>

          <Button type="submit" className="w-full" variant="glow">
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
