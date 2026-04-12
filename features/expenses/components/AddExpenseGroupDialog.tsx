"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Receipt, FileText, Zap } from "lucide-react";
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
import {
  parseExpenseTemplate,
  type ParsedTemplate,
} from "@/services/template-parser";

interface AddExpenseGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExpenseGroupFormData) => void;
  friends?: string[];
  onQuickSubmit?: (data: ParsedTemplate) => void;
}

const PLACEHOLDER_TEMPLATE = `McDonald's
500 for all paid by Rahul on Burgers.
200 for Amit, Priya paid by Amit on Fries.
tax is 5%
discount is 10rs`;

export function AddExpenseGroupDialog({
  open,
  onOpenChange,
  onSubmit,
  friends = [],
  onQuickSubmit,
}: AddExpenseGroupDialogProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "quick">("manual");
  const [templateText, setTemplateText] = useState("");
  const [quickSubmitErrors, setQuickSubmitErrors] = useState<
    { line: number; message: string }[]
  >([]);

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

  const parseResult = useMemo(() => {
    if (!templateText.trim()) return null;
    return parseExpenseTemplate(templateText, friends);
  }, [templateText, friends]);

  const handleFormSubmit = (data: CreateExpenseGroupFormData) => {
    onSubmit(data);
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setTemplateText("");
      setQuickSubmitErrors([]);
      setActiveTab("manual");
    }
    onOpenChange(newOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  const handleQuickSubmit = () => {
    if (!templateText.trim()) {
      setQuickSubmitErrors([{ line: 1, message: "Template is empty" }]);
      return;
    }

    const result = parseExpenseTemplate(templateText, friends);
    if (!result.success) {
      setQuickSubmitErrors(result.errors);
      return;
    }

    setQuickSubmitErrors([]);
    onQuickSubmit?.(result.data);
    setTemplateText("");
  };

  const showQuickTab = friends.length > 0 && !!onQuickSubmit;

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

        {/* Tab toggle */}
        {showQuickTab && (
          <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "manual"
                  ? "bg-primary text-white"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("manual")}
            >
              <FileText className="w-4 h-4" />
              Manual
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "quick"
                  ? "bg-primary text-white"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("quick")}
            >
              <Zap className="w-4 h-4" />
              Quick Entry
            </button>
          </div>
        )}

        {/* Manual tab */}
        {activeTab === "manual" && (
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

            <Button type="submit" className="w-full" variant="glow">
              <Plus className="w-5 h-5" />
              Add Expense Group
            </Button>
          </form>
        )}

        {/* Quick Entry tab */}
        {activeTab === "quick" && (
          <div className="space-y-4">
            {/* Errors */}
            {quickSubmitErrors.length > 0 && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm space-y-1">
                {quickSubmitErrors.map((err, i) => (
                  <div key={i}>
                    <span className="font-medium">Line {err.line}:</span>{" "}
                    {err.message}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quickTemplate">Template</Label>
              <textarea
                id="quickTemplate"
                value={templateText}
                onChange={(e) => {
                  setTemplateText(e.target.value);
                  setQuickSubmitErrors([]);
                }}
                placeholder={PLACEHOLDER_TEMPLATE}
                rows={8}
                className="w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground hover:border-white/20 hover:bg-white/[0.07] focus:border-primary/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20 resize-none font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Format: amount for friends paid by payer on itemName
              </p>
            </div>

            {/* Live preview */}
            {parseResult && parseResult.success && (
              <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm space-y-1">
                <div className="font-medium text-foreground">
                  {parseResult.data.groupName}
                </div>
                <div className="text-muted-foreground">
                  {parseResult.data.items.length} item
                  {parseResult.data.items.length !== 1 ? "s" : ""}
                  {parseResult.data.tax && (
                    <span>
                      {" "}
                      &middot; Tax:{" "}
                      {parseResult.data.tax.mode === "percentage"
                        ? `${parseResult.data.tax.percent}%`
                        : `₹${parseResult.data.tax.value}`}
                    </span>
                  )}
                  {parseResult.data.discount && (
                    <span>
                      {" "}
                      &middot; Discount:{" "}
                      {parseResult.data.discount.mode === "percentage"
                        ? `${parseResult.data.discount.percent}%`
                        : `₹${parseResult.data.discount.value}`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Live parse errors */}
            {parseResult && !parseResult.success && quickSubmitErrors.length === 0 && (
              <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm space-y-1">
                {parseResult.errors.map((err, i) => (
                  <div key={i}>
                    <span className="font-medium">Line {err.line}:</span>{" "}
                    {err.message}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              variant="glow"
              onClick={handleQuickSubmit}
              disabled={!templateText.trim()}
            >
              <Plus className="w-5 h-5" />
              Add Expense Group
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
