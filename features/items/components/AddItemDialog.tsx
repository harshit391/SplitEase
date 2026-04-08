"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, DollarSign, User, Users, Percent, IndianRupee } from "lucide-react";
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
  defaultPayer?: string | null;
  taxDiscountLevel?: "group" | "item";
  onSubmit: (data: CreateItemFormData, continueAdding: boolean) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  friends,
  defaultPayer,
  taxDiscountLevel = "group",
  onSubmit,
}: AddItemDialogProps) {
  const [continueMode, setContinueMode] = useState(false);
  const [taxMode, setTaxMode] = useState<"percentage" | "value">("percentage");
  const [discountMode, setDiscountMode] = useState<"percentage" | "value">("percentage");

  const isItemLevel = taxDiscountLevel === "item";

  const resolvedDefaultPayer = (defaultPayer && friends.includes(defaultPayer)) ? defaultPayer : friends[0] || "";

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
      paidBy: resolvedDefaultPayer,
      splitAmong: [...friends],
      taxPercent: 0,
      taxValue: 0,
      taxMode: "percentage",
      discountPercent: 0,
      discountValue: 0,
      discountMode: "percentage",
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
    // Set the correct mode and clear the unused field
    if (isItemLevel) {
      if (taxMode === "percentage") {
        data.taxMode = "percentage";
        data.taxValue = 0;
      } else {
        data.taxMode = "value";
        data.taxPercent = 0;
      }
      if (discountMode === "percentage") {
        data.discountMode = "percentage";
        data.discountValue = 0;
      } else {
        data.discountMode = "value";
        data.discountPercent = 0;
      }
    }
    onSubmit(data, continueMode);
    if (continueMode) {
      reset({
        name: "",
        amount: 0,
        paidBy: resolvedDefaultPayer,
        splitAmong: [...friends],
        taxPercent: 0,
        taxValue: 0,
        taxMode: "percentage",
        discountPercent: 0,
        discountValue: 0,
        discountMode: "percentage",
      });
      setTaxMode("percentage");
      setDiscountMode("percentage");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset({
        name: "",
        amount: 0,
        paidBy: resolvedDefaultPayer,
        splitAmong: [...friends],
        taxPercent: 0,
        taxValue: 0,
        taxMode: "percentage",
        discountPercent: 0,
        discountValue: 0,
        discountMode: "percentage",
      });
      setContinueMode(false);
      setTaxMode("percentage");
      setDiscountMode("percentage");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a bill item with who paid and how to split
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {Object.keys(errors).length > 0 && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
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
            />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="pl-8"
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
                size="xs"
                onClick={selectAllSplit}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={clearAllSplit}
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
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
                      : ""
                  }
                >
                  {f}
                </Button>
              ))}
            </div>
            {splitAmong.length > 0 && amount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                ${perPerson} per person ({splitAmong.length} people)
              </p>
            )}
          </div>

          {/* Item-level Tax & Discount */}
          {isItemLevel && (
            <>
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
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="submit"
              onClick={() => setContinueMode(true)}
              variant="glow"
            >
              <Plus className="w-5 h-5" />
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
