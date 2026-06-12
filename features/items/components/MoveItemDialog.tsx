"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ExpenseGroup, Item } from "@/types";

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  sourceExpenseGroupId: string;
  expenseGroups: ExpenseGroup[];
  onSubmit: (targetExpenseGroupId: string) => void;
}

export function MoveItemDialog({
  open,
  onOpenChange,
  item,
  sourceExpenseGroupId,
  expenseGroups,
  onSubmit,
}: MoveItemDialogProps) {
  const [targetGroupId, setTargetGroupId] = useState<string>("");

  const availableGroups = expenseGroups.filter(
    (g) => g.id !== sourceExpenseGroupId
  );

  const handleSubmit = () => {
    if (targetGroupId) {
      onSubmit(targetGroupId);
      setTargetGroupId("");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setTargetGroupId("");
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Move Item
          </DialogTitle>
          <DialogDescription>
            Move &quot;{item.name}&quot; to another expense group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Select value={targetGroupId} onValueChange={setTargetGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Select target group" />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSubmit}
            disabled={!targetGroupId}
            className="w-full"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Move
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
