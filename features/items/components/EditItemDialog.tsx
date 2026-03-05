"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, DollarSign, User, Users } from "lucide-react";
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
import { editItemSchema, type EditItemFormData } from "../schemas/item.schema";
import type { Item } from "@/types";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  friends: string[];
  onSubmit: (data: EditItemFormData) => void;
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
  friends,
  onSubmit,
}: EditItemDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      name: item.name,
      amount: item.amount,
      paidBy: item.paidBy,
      splitAmong: item.splitAmong,
    },
  });

  const paidBy = watch("paidBy");
  const splitAmong = watch("splitAmong");
  const amount = watch("amount");

  useEffect(() => {
    if (open) {
      reset({
        name: item.name,
        amount: item.amount,
        paidBy: item.paidBy,
        splitAmong: item.splitAmong,
      });
    }
  }, [open, item, reset]);

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

  const handleFormSubmit = (data: EditItemFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/10">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update item details
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
