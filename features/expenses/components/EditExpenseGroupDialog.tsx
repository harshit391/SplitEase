"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Receipt } from "lucide-react";
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
import type { ExpenseGroup } from "@/types";

const editExpenseGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Expense group name is required")
    .max(100, "Name is too long"),
  taxPercent: z.number().min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%"),
});

type FormData = z.infer<typeof editExpenseGroupSchema>;

interface EditExpenseGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseGroup: ExpenseGroup;
  onSubmit: (data: { name: string; taxPercent: number }) => void;
}

export function EditExpenseGroupDialog({
  open,
  onOpenChange,
  expenseGroup,
  onSubmit,
}: EditExpenseGroupDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(editExpenseGroupSchema),
    defaultValues: {
      name: expenseGroup.name,
      taxPercent: expenseGroup.taxPercent,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: expenseGroup.name,
        taxPercent: expenseGroup.taxPercent,
      });
    }
  }, [open, expenseGroup, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <DialogTitle>Edit Expense Group</DialogTitle>
          <DialogDescription>
            Update expense group name and tax percentage
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {(errors.name || errors.taxPercent) && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errors.name?.message || errors.taxPercent?.message}
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

          <div className="space-y-2">
            <Label htmlFor="editExpenseGroupTax">Tax Percentage (%)</Label>
            <Input
              id="editExpenseGroupTax"
              type="number"
              {...register("taxPercent", { valueAsNumber: true })}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="glow"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
