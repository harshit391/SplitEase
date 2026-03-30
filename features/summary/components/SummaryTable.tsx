"use client";

import { useState } from "react";
import {
  IndianRupee,
  Download,
  FileText,
  Trophy,
  FileSpreadsheet,
  Check,
  Link2,
  ExternalLink,
} from "lucide-react";
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
import type { Trip } from "@/types";
import {
  calculateSubTopicPersonTotals,
  calculateTotalSpentPerPerson,
  findLowestSpender,
} from "@/services";
import {
  downloadCSV,
  downloadDetailedCSV,
  generateSummaryTSV,
  copyToClipboard,
} from "@/services";

interface SummaryTableProps {
  trip: Trip;
  excludedSubTopicIds: string[];
  onUpdateGoogleSheetUrl?: (url: string | null) => void;
}

export function SummaryTable({
  trip,
  excludedSubTopicIds,
  onUpdateGoogleSheetUrl,
}: SummaryTableProps) {
  const [copied, setCopied] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState(trip.googleSheetUrl || "");

  const includedSubTopics = trip.subTopics.filter(
    (sub) => !excludedSubTopicIds.includes(sub.id)
  );

  const grandTotals = calculateTotalSpentPerPerson(trip, excludedSubTopicIds);
  const grandTotal = Object.values(grandTotals).reduce((a, b) => a + b, 0);
  const lowestSpender = findLowestSpender(grandTotals);

  const handleDownloadCSV = () => {
    downloadCSV(trip, excludedSubTopicIds);
  };

  const handleDownloadDetailedCSV = () => {
    downloadDetailedCSV(trip, excludedSubTopicIds);
  };

  const handleCopyForSheets = async () => {
    const tsv = generateSummaryTSV(trip, excludedSubTopicIds);
    const success = await copyToClipboard(tsv);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSaveLink = () => {
    if (linkInput.trim() && onUpdateGoogleSheetUrl) {
      onUpdateGoogleSheetUrl(linkInput.trim());
      setShowLinkInput(false);
    }
  };

  const handleRemoveLink = () => {
    if (onUpdateGoogleSheetUrl) {
      onUpdateGoogleSheetUrl(null);
      setLinkInput("");
      setShowLinkInput(false);
    }
  };

  const handleOpenLinkedSheet = () => {
    if (trip.googleSheetUrl) {
      window.open(trip.googleSheetUrl, "_blank");
    }
  };

  if (includedSubTopics.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No expenses to display
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
          <Download className="w-4 h-4" />
          Download CSV
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadDetailedCSV}>
          <FileText className="w-4 h-4" />
          Detailed CSV
        </Button>

        {trip.googleSheetUrl ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenLinkedSheet}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <ExternalLink className="w-4 h-4" />
            Open Linked Sheet
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyForSheets}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied! Paste in Sheet
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Copy for Google Sheets
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLinkInput(trip.googleSheetUrl || "");
            setShowLinkInput(!showLinkInput);
          }}
          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
        >
          <Link2 className="w-4 h-4" />
          {trip.googleSheetUrl ? "Edit Link" : "Attach Link"}
        </Button>
      </div>

      {/* Link Input Section */}
      {showLinkInput && (
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Google Sheets URL
          </label>
          <Input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveLink}>
              Save Link
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowLinkInput(false)}
            >
              Cancel
            </Button>
            {trip.googleSheetUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveLink}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Remove Link
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/[0.02]">
              <TableHead className="min-w-[120px]">Expense</TableHead>
              {trip.friends.map((f) => (
                <TableHead
                  key={f}
                  className={`text-center min-w-[80px] ${
                    f === lowestSpender
                      ? "bg-amber-500/20 text-amber-400"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {f === lowestSpender && <Trophy className="w-4 h-4" />}
                    {f}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {includedSubTopics.map((sub) => {
              const { totals } = calculateSubTopicPersonTotals(
                sub,
                trip.friends
              );
              const subTotal = Object.values(totals).reduce((a, b) => a + b, 0);

              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  {trip.friends.map((f) => (
                    <TableCell
                      key={f}
                      className={`text-center ${
                        f === lowestSpender ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3 text-muted-foreground" />
                        {totals[f].toFixed(2)}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium">
                    <span className="inline-flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {subTotal.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Grand Total Row */}
            <TableRow className="bg-primary/5 font-bold border-t-2 border-primary/20">
              <TableCell className="text-primary">Grand Total</TableCell>
              {trip.friends.map((f) => (
                <TableCell
                  key={f}
                  className={`text-center ${
                    f === lowestSpender
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-primary"
                  }`}
                >
                  <span className="inline-flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {grandTotals[f].toFixed(2)}
                  </span>
                </TableCell>
              ))}
              <TableCell className="text-center text-primary">
                <span className="inline-flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />
                  {grandTotal.toFixed(2)}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
