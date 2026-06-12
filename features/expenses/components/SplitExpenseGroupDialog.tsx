"use client";

import { useState } from "react";
import { Scissors, IndianRupee } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { ExpenseGroup } from "@/types";

interface SplitExpenseGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseGroup: ExpenseGroup;
  onSubmit: (newGroupName: string, itemIds: string[]) => void;
}

export function SplitExpenseGroupDialog({
  open,
  onOpenChange,
  expenseGroup,
  onSubmit,
}: SplitExpenseGroupDialogProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (newGroupName.trim() && selectedItemIds.size > 0) {
      onSubmit(newGroupName.trim(), Array.from(selectedItemIds));
      setNewGroupName("");
      setSelectedItemIds(new Set());
    }
  };

  const canSubmit =
    newGroupName.trim().length > 0 &&
    selectedItemIds.size > 0 &&
    selectedItemIds.size < expenseGroup.items.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setNewGroupName("");
          setSelectedItemIds(new Set());
        }
      }}
    >
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Split Group
          </DialogTitle>
          <DialogDescription>
            Move selected items from &quot;{expenseGroup.name}&quot; into a new group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-group-name">New Group Name</Label>
            <Input
              id="new-group-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Drinks, Snacks..."
            />
          </div>

          <div className="space-y-2">
            <Label>Select items to move ({selectedItemIds.size} selected)</Label>
            <div className="max-h-[250px] overflow-y-auto rounded-xl border border-white/5 divide-y divide-white/5">
              {expenseGroup.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedItemIds.has(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <span className="flex-1 text-sm text-foreground truncate">
                    {item.name}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-0.5 shrink-0">
                    <IndianRupee className="w-3 h-3" />
                    {item.amount.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
            {selectedItemIds.size === expenseGroup.items.length && (
              <p className="text-xs text-amber-400">
                You can&apos;t move all items — at least one must remain in the original group.
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            <Scissors className="w-4 h-4" />
            Split ({selectedItemIds.size} items)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
