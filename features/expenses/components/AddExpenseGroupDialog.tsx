"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Receipt } from "lucide-react";
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
import {
  createExpenseGroupSchema,
  type CreateExpenseGroupFormData,
} from "../schemas/expense-group.schema";

interface AddExpenseGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExpenseGroupFormData) => void;
}

export function AddExpenseGroupDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddExpenseGroupDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateExpenseGroupFormData>({
    resolver: zodResolver(createExpenseGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleFormSubmit = (data: CreateExpenseGroupFormData) => {
    onSubmit(data);
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <DialogTitle>Add Expense Group</DialogTitle>
          <DialogDescription>
            e.g., McDonald&apos;s, Hotel Stay, Cab Fare
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {errors.name && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errors.name.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expenseGroupName">Expense Group Name</Label>
            <Input
              id="expenseGroupName"
              {...register("name")}
              placeholder="Expense group name"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="glow"
          >
            <Plus className="w-5 h-5" />
            Add Expense Group
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
