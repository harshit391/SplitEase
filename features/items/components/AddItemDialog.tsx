"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, DollarSign, User, Users } from "lucide-react";
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
import { createItemSchema, type CreateItemFormData } from "../schemas/item.schema";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friends: string[];
  onSubmit: (data: CreateItemFormData, continueAdding: boolean) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  friends,
  onSubmit,
}: AddItemDialogProps) {
  const [continueMode, setContinueMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      amount: 0,
      paidBy: friends[0] || "",
      splitAmong: [...friends],
    },
  });

  const paidBy = watch("paidBy");
  const splitAmong = watch("splitAmong");
  const amount = watch("amount");

  const toggleSplit = (friend: string) => {
    if (splitAmong.includes(friend)) {
      setValue(
        "splitAmong",
        splitAmong.filter((f) => f !== friend)
      );
    } else {
      setValue("splitAmong", [...splitAmong, friend]);
    }
  };

  const selectAllSplit = () => {
    setValue("splitAmong", [...friends]);
  };

  const clearAllSplit = () => {
    setValue("splitAmong", []);
  };

  const perPerson =
    splitAmong.length > 0 && amount
      ? (amount / splitAmong.length).toFixed(2)
      : "0.00";

  const handleFormSubmit = (data: CreateItemFormData) => {
    onSubmit(data, continueMode);
    if (continueMode) {
      reset({
        name: "",
        amount: 0,
        paidBy: friends[0] || "",
        splitAmong: [...friends],
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset({
        name: "",
        amount: 0,
        paidBy: friends[0] || "",
        splitAmong: [...friends],
      });
      setContinueMode(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/10">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a bill item with who paid and how to split
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {Object.keys(errors).length > 0 && (
            <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {errors.name?.message ||
                errors.amount?.message ||
                errors.paidBy?.message ||
                errors.splitAmong?.message}
            </div>
          )}

          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input
              {...register("name")}
              placeholder="e.g., Big Mac Combo"
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="pl-8 bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Paid By
            </Label>
            <div className="flex flex-wrap gap-2">
              {friends.map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={paidBy === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("paidBy", f)}
                  className={
                    paidBy === f
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : ""
                  }
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Split Among
            </Label>
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllSplit}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllSplit}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {friends.map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={splitAmong.includes(f) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSplit(f)}
                  className={
                    splitAmong.includes(f)
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400"
                      : ""
                  }
                >
                  {f}
                </Button>
              ))}
            </div>
            {splitAmong.length > 0 && amount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                ₹{perPerson} per person ({splitAmong.length} people)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="submit"
              onClick={() => setContinueMode(true)}
              className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add & Continue
            </Button>
            <Button
              type="submit"
              variant="secondary"
              onClick={() => setContinueMode(false)}
            >
              Add & Close
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
