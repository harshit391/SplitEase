"use client";

import { useState } from "react";
import { Trash2, Edit, Plus, IndianRupee, Save } from "lucide-react";
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
import type { ExpenseGroup, Trip, Item } from "@/types";
import { calculateSubTopicPersonTotals } from "@/services";

interface ItemTableProps {
  trip: Trip;
  expenseGroup: ExpenseGroup;
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateTax: (taxPercent: number) => void;
}

export function ItemTable({
  trip,
  expenseGroup,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateTax,
}: ItemTableProps) {
  const [editingTax, setEditingTax] = useState(false);
  const [taxValue, setTaxValue] = useState(expenseGroup.taxPercent.toString());

  const { totals, baseTotals, taxPerPerson, totalTax, subTopicTotal } =
    calculateSubTopicPersonTotals(expenseGroup, trip.friends);

  const handleSaveTax = () => {
    const newTax = parseFloat(taxValue) || 0;
    onUpdateTax(Math.max(0, Math.min(100, newTax)));
    setEditingTax(false);
  };

  if (expenseGroup.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No items yet</p>
        <Button variant="outline" onClick={onAddItem}>
          <Plus className="w-4 h-4" />
          Add First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tax Input */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <span className="text-sm text-amber-400 font-medium">Tax %:</span>
        {editingTax ? (
          <>
            <Input
              type="number"
              value={taxValue}
              onChange={(e) => setTaxValue(e.target.value)}
              className="w-20 h-8 text-sm"
              min="0"
              max="100"
              step="0.1"
            />
            <Button size="sm" onClick={handleSaveTax}>
              <Save className="w-3 h-3" />
              Save
            </Button>
          </>
        ) : (
          <>
            <span className="text-amber-400 font-bold">
              {expenseGroup.taxPercent}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTaxValue(expenseGroup.taxPercent.toString());
                setEditingTax(true);
              }}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
            >
              <Edit className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>

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
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseGroup.items.map((item) => {
              const perPerson =
                item.splitAmong.length > 0
                  ? item.amount / item.splitAmong.length
                  : 0;

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
                  <TableCell className="text-center font-medium text-primary">
                    <span className="inline-flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {item.amount.toFixed(2)}
                    </span>
                  </TableCell>
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
                </TableRow>
              );
            })}

            {/* Tax Row */}
            {expenseGroup.taxPercent > 0 && (
              <TableRow className="bg-amber-500/5">
                <TableCell className="font-medium text-amber-400">
                  Tax ({expenseGroup.taxPercent}%)
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
              <TableCell className="text-center text-primary">
                <span className="inline-flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />
                  {(subTopicTotal + totalTax).toFixed(2)}
                </span>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button variant="outline" onClick={onAddItem} className="w-full">
        <Plus className="w-4 h-4" />
        Add Item
      </Button>
    </div>
  );
}
