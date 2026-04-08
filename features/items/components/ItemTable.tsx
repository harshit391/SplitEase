"use client";

import { useState } from "react";
import { Trash2, Edit, Plus, IndianRupee, Save, Percent } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExpenseGroup, ExpenseGroupUpdate, Trip, Item } from "@/types";
import {
  calculateSubTopicPersonTotals,
  calculateItemTaxDiscount,
} from "@/services";

interface ItemTableProps {
  trip: Trip;
  expenseGroup: ExpenseGroup;
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateExpenseGroup: (updates: ExpenseGroupUpdate) => void;
  readOnly?: boolean;
}

export function ItemTable({
  trip,
  expenseGroup,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateExpenseGroup,
  readOnly = false,
}: ItemTableProps) {
  const isItemLevel =
    (expenseGroup.taxDiscountLevel || "group") === "item";
  const taxMode = expenseGroup.taxMode || "percentage";
  const discountMode = expenseGroup.discountMode || "percentage";

  const [editingTax, setEditingTax] = useState(false);
  const [taxInputMode, setTaxInputMode] = useState<"percentage" | "value">(taxMode);
  const [taxInputValue, setTaxInputValue] = useState(
    taxMode === "value"
      ? (expenseGroup.taxValue || 0).toString()
      : (expenseGroup.taxPercent || 0).toString()
  );

  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountInputMode, setDiscountInputMode] = useState<"percentage" | "value">(discountMode);
  const [discountInputValue, setDiscountInputValue] = useState(
    discountMode === "value"
      ? (expenseGroup.discountValue || 0).toString()
      : (expenseGroup.discountPercent || 0).toString()
  );

  const {
    totals,
    baseTotals,
    taxPerPerson,
    totalTax,
    discountPerPerson,
    totalDiscount,
    subTopicTotal,
  } = calculateSubTopicPersonTotals(expenseGroup, trip.friends);

  const totalAfterTax = subTopicTotal + totalTax;

  // Compute auto-calculated display values for tax
  const taxDisplayPercent =
    taxMode === "value" && subTopicTotal > 0
      ? (((expenseGroup.taxValue || 0) / subTopicTotal) * 100).toFixed(2)
      : (expenseGroup.taxPercent || 0).toString();
  const taxDisplayValue =
    taxMode === "percentage" ? totalTax.toFixed(2) : (expenseGroup.taxValue || 0).toFixed(2);

  // Compute auto-calculated display values for discount
  const discountDisplayPercent =
    discountMode === "value" && totalAfterTax > 0
      ? (((expenseGroup.discountValue || 0) / totalAfterTax) * 100).toFixed(2)
      : (expenseGroup.discountPercent || 0).toString();
  const discountDisplayValue =
    discountMode === "percentage"
      ? totalDiscount.toFixed(2)
      : (expenseGroup.discountValue || 0).toFixed(2);

  const handleSaveTax = () => {
    const val = parseFloat(taxInputValue) || 0;
    if (taxInputMode === "percentage") {
      onUpdateExpenseGroup({
        taxPercent: Math.max(0, Math.min(100, val)),
        taxMode: "percentage",
        taxValue: 0,
      });
    } else {
      onUpdateExpenseGroup({
        taxValue: Math.max(0, val),
        taxMode: "value",
        taxPercent: 0,
      });
    }
    setEditingTax(false);
  };

  const handleSaveDiscount = () => {
    const val = parseFloat(discountInputValue) || 0;
    if (discountInputMode === "percentage") {
      onUpdateExpenseGroup({
        discountPercent: Math.max(0, Math.min(100, val)),
        discountMode: "percentage",
        discountValue: 0,
      });
    } else {
      onUpdateExpenseGroup({
        discountValue: Math.max(0, val),
        discountMode: "value",
        discountPercent: 0,
      });
    }
    setEditingDiscount(false);
  };

  const hasTax = totalTax > 0;
  const hasDiscount = totalDiscount > 0;

  if (expenseGroup.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No items yet</p>
        {!readOnly && (
          <Button variant="outline" onClick={onAddItem}>
            <Plus className="w-4 h-4" />
            Add First Item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group-level Tax/Discount Inputs (only in group mode, not readOnly) */}
      {!isItemLevel && !readOnly && (
        <>
          {/* Tax Input */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-sm text-amber-400 font-medium">Tax:</span>
            {editingTax ? (
              <>
                <div className="flex rounded-lg overflow-hidden border border-amber-500/30">
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                      taxInputMode === "percentage"
                        ? "bg-amber-500 text-white"
                        : "bg-transparent text-amber-400 hover:bg-amber-500/20"
                    }`}
                    onClick={() => {
                      setTaxInputMode("percentage");
                      setTaxInputValue((expenseGroup.taxPercent || 0).toString());
                    }}
                  >
                    <Percent className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                      taxInputMode === "value"
                        ? "bg-amber-500 text-white"
                        : "bg-transparent text-amber-400 hover:bg-amber-500/20"
                    }`}
                    onClick={() => {
                      setTaxInputMode("value");
                      setTaxInputValue((expenseGroup.taxValue || 0).toString());
                    }}
                  >
                    <IndianRupee className="w-3 h-3" />
                  </button>
                </div>
                <Input
                  type="number"
                  value={taxInputValue}
                  onChange={(e) => setTaxInputValue(e.target.value)}
                  className="w-24 h-8 text-sm"
                  min="0"
                  max={taxInputMode === "percentage" ? "100" : undefined}
                  step="0.1"
                  placeholder={taxInputMode === "percentage" ? "%" : "₹"}
                />
                <Button size="sm" onClick={handleSaveTax}>
                  <Save className="w-3 h-3" />
                  Save
                </Button>
              </>
            ) : (
              <>
                {taxMode === "percentage" ? (
                  <span className="text-amber-400 font-bold">
                    {expenseGroup.taxPercent || 0}%
                    {hasTax && (
                      <span className="ml-1 font-normal text-amber-400/70 text-xs">
                        = ₹{taxDisplayValue}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    ₹{(expenseGroup.taxValue || 0).toFixed(2)}
                    {hasTax && subTopicTotal > 0 && (
                      <span className="ml-1 font-normal text-amber-400/70 text-xs">
                        = {taxDisplayPercent}%
                      </span>
                    )}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTaxInputMode(taxMode);
                    setTaxInputValue(
                      taxMode === "value"
                        ? (expenseGroup.taxValue || 0).toString()
                        : (expenseGroup.taxPercent || 0).toString()
                    );
                    setEditingTax(true);
                  }}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>

          {/* Discount Input */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-sm text-emerald-400 font-medium">Discount:</span>
            {editingDiscount ? (
              <>
                <div className="flex rounded-lg overflow-hidden border border-emerald-500/30">
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                      discountInputMode === "percentage"
                        ? "bg-emerald-500 text-white"
                        : "bg-transparent text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                    onClick={() => {
                      setDiscountInputMode("percentage");
                      setDiscountInputValue(
                        (expenseGroup.discountPercent || 0).toString()
                      );
                    }}
                  >
                    <Percent className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                      discountInputMode === "value"
                        ? "bg-emerald-500 text-white"
                        : "bg-transparent text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                    onClick={() => {
                      setDiscountInputMode("value");
                      setDiscountInputValue(
                        (expenseGroup.discountValue || 0).toString()
                      );
                    }}
                  >
                    <IndianRupee className="w-3 h-3" />
                  </button>
                </div>
                <Input
                  type="number"
                  value={discountInputValue}
                  onChange={(e) => setDiscountInputValue(e.target.value)}
                  className="w-24 h-8 text-sm"
                  min="0"
                  max={discountInputMode === "percentage" ? "100" : undefined}
                  step="0.1"
                  placeholder={discountInputMode === "percentage" ? "%" : "₹"}
                />
                <Button size="sm" onClick={handleSaveDiscount}>
                  <Save className="w-3 h-3" />
                  Save
                </Button>
              </>
            ) : (
              <>
                {discountMode === "percentage" ? (
                  <span className="text-emerald-400 font-bold">
                    {expenseGroup.discountPercent || 0}%
                    {hasDiscount && (
                      <span className="ml-1 font-normal text-emerald-400/70 text-xs">
                        = ₹{discountDisplayValue}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    ₹{(expenseGroup.discountValue || 0).toFixed(2)}
                    {hasDiscount && totalAfterTax > 0 && (
                      <span className="ml-1 font-normal text-emerald-400/70 text-xs">
                        = {discountDisplayPercent}%
                      </span>
                    )}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDiscountInputMode(discountMode);
                    setDiscountInputValue(
                      discountMode === "value"
                        ? (expenseGroup.discountValue || 0).toString()
                        : (expenseGroup.discountPercent || 0).toString()
                    );
                    setEditingDiscount(true);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {/* Items Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/[0.02]">
              <TableHead className="min-w-[120px]">Item</TableHead>
              <TableHead>Paid By</TableHead>
              {trip.friends.map((f) => (
                <TableHead key={f} className="text-center min-w-[80px]">
                  {f}
                </TableHead>
              ))}
              {isItemLevel && (
                <TableHead className="text-center min-w-[80px]">Tax</TableHead>
              )}
              {isItemLevel && (
                <TableHead className="text-center min-w-[80px]">Discount</TableHead>
              )}
              <TableHead className="text-center">Total</TableHead>
              {!readOnly && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseGroup.items.map((item) => {
              const perPerson =
                item.splitAmong.length > 0
                  ? item.amount / item.splitAmong.length
                  : 0;

              const itemTaxDiscount = isItemLevel
                ? calculateItemTaxDiscount(item)
                : { tax: 0, discount: 0 };
              const itemTotal = isItemLevel
                ? item.amount + itemTaxDiscount.tax - itemTaxDiscount.discount
                : item.amount;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                      {item.paidBy}
                    </span>
                  </TableCell>
                  {trip.friends.map((f) => (
                    <TableCell key={f} className="text-center">
                      {item.splitAmong.includes(f) ? (
                        <span className="inline-flex items-center gap-0.5 text-foreground">
                          <IndianRupee className="w-3 h-3 text-muted-foreground" />
                          {perPerson.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  ))}
                  {isItemLevel && (
                    <TableCell className="text-center text-amber-400">
                      {itemTaxDiscount.tax > 0 ? (
                        <span className="inline-flex items-center gap-0.5">
                          +<IndianRupee className="w-3 h-3" />
                          {itemTaxDiscount.tax.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  {isItemLevel && (
                    <TableCell className="text-center text-emerald-400">
                      {itemTaxDiscount.discount > 0 ? (
                        <span className="inline-flex items-center gap-0.5">
                          -<IndianRupee className="w-3 h-3" />
                          {itemTaxDiscount.discount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-center font-medium text-primary">
                    <span className="inline-flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {itemTotal.toFixed(2)}
                    </span>
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400"
                          onClick={() => onEditItem(item)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (window.confirm("Delete this item?")) {
                              onDeleteItem(item.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

            {/* Tax Row (group mode only) */}
            {!isItemLevel && hasTax && (
              <TableRow className="bg-amber-500/5">
                <TableCell className="font-medium text-amber-400">
                  Tax (
                  {taxMode === "percentage"
                    ? `${expenseGroup.taxPercent}%`
                    : `₹${(expenseGroup.taxValue || 0).toFixed(2)}`}
                  )
                </TableCell>
                <TableCell></TableCell>
                {trip.friends.map((f) => (
                  <TableCell key={f} className="text-center text-amber-400">
                    <span className="inline-flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {taxPerPerson[f].toFixed(2)}
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium text-amber-400">
                  <span className="inline-flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {totalTax.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}

            {/* Discount Row (group mode only) */}
            {!isItemLevel && hasDiscount && (
              <TableRow className="bg-emerald-500/5">
                <TableCell className="font-medium text-emerald-400">
                  Discount (
                  {discountMode === "percentage"
                    ? `${expenseGroup.discountPercent}%`
                    : `₹${(expenseGroup.discountValue || 0).toFixed(2)}`}
                  )
                </TableCell>
                <TableCell></TableCell>
                {trip.friends.map((f) => (
                  <TableCell key={f} className="text-center text-emerald-400">
                    <span className="inline-flex items-center gap-0.5">
                      -<IndianRupee className="w-3 h-3" />
                      {discountPerPerson[f].toFixed(2)}
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium text-emerald-400">
                  <span className="inline-flex items-center gap-0.5">
                    -<IndianRupee className="w-3 h-3" />
                    {totalDiscount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}

            {/* Subtotal Row */}
            <TableRow className="bg-primary/5 font-bold">
              <TableCell className="text-primary">Subtotal</TableCell>
              <TableCell></TableCell>
              {trip.friends.map((f) => (
                <TableCell key={f} className="text-center text-primary">
                  <span className="inline-flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {totals[f].toFixed(2)}
                  </span>
                </TableCell>
              ))}
              {isItemLevel && <TableCell></TableCell>}
              {isItemLevel && <TableCell></TableCell>}
              <TableCell className="text-center text-primary">
                <span className="inline-flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />
                  {(subTopicTotal + totalTax - totalDiscount).toFixed(2)}
                </span>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {!readOnly && (
        <Button variant="outline" onClick={onAddItem} className="w-full">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      )}
    </div>
  );
}
