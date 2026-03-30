import type { Trip, Settlement } from "@/types";
import {
  calculateSubTopicPersonTotals,
  calculateTotalSpentPerPerson,
} from "./settlement.service";

export function exportTripAsJSON(trip: Trip): void {
  const json = JSON.stringify(trip, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${trip.name.replace(/[^a-zA-Z0-9]/g, "_")}_${trip.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateSummaryCSV(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): string {
  const includedSubTopics = trip.subTopics.filter(
    (sub) => !excludedSubTopicIds.includes(sub.id)
  );

  // Header row
  const headers = ["Expense", ...trip.friends, "Total"];
  const rows: string[][] = [headers];

  // Data rows for each expense group
  includedSubTopics.forEach((sub) => {
    const { totals } = calculateSubTopicPersonTotals(sub, trip.friends);
    const subTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    const row = [
      sub.name,
      ...trip.friends.map((f) => totals[f].toFixed(2)),
      subTotal.toFixed(2),
    ];
    rows.push(row);
  });

  // Grand total row
  const grandTotals = calculateTotalSpentPerPerson(trip, excludedSubTopicIds);
  const grandTotal = Object.values(grandTotals).reduce((a, b) => a + b, 0);
  const grandTotalRow = [
    "Grand Total",
    ...trip.friends.map((f) => grandTotals[f].toFixed(2)),
    grandTotal.toFixed(2),
  ];
  rows.push(grandTotalRow);

  return rows.map((row) => row.join(",")).join("\n");
}

export function downloadCSV(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): void {
  const csv = generateSummaryCSV(trip, excludedSubTopicIds);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${trip.name.replace(/[^a-zA-Z0-9]/g, "_")}_summary.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateSummaryTSV(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): string {
  const includedSubTopics = trip.subTopics.filter(
    (sub) => !excludedSubTopicIds.includes(sub.id)
  );

  // Header row
  const headers = ["Expense", ...trip.friends, "Total"];
  const rows: string[][] = [headers];

  // Data rows
  includedSubTopics.forEach((sub) => {
    const { totals } = calculateSubTopicPersonTotals(sub, trip.friends);
    const subTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    const row = [
      sub.name,
      ...trip.friends.map((f) => totals[f].toFixed(2)),
      subTotal.toFixed(2),
    ];
    rows.push(row);
  });

  // Grand total row
  const grandTotals = calculateTotalSpentPerPerson(trip, excludedSubTopicIds);
  const grandTotal = Object.values(grandTotals).reduce((a, b) => a + b, 0);
  const grandTotalRow = [
    "Grand Total",
    ...trip.friends.map((f) => grandTotals[f].toFixed(2)),
    grandTotal.toFixed(2),
  ];
  rows.push(grandTotalRow);

  return rows.map((row) => row.join("\t")).join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function generateDetailedCSV(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): string {
  const includedSubTopics = trip.subTopics.filter(
    (sub) => !excludedSubTopicIds.includes(sub.id)
  );

  const headers = [
    "Expense Group",
    "Item",
    "Amount",
    "Paid By",
    "Split Among",
    ...trip.friends,
    "Total",
  ];
  const rows: string[][] = [headers];

  const grandTotals: Record<string, number> = {};
  trip.friends.forEach((f) => {
    grandTotals[f] = 0;
  });
  let grandTotal = 0;

  includedSubTopics.forEach((sub) => {
    const { totals, baseTotals, totalTax } = calculateSubTopicPersonTotals(
      sub,
      trip.friends
    );
    const subTopicTotal = sub.items.reduce((s, i) => s + i.amount, 0);

    // Individual item rows
    sub.items.forEach((item) => {
      const splitCount = item.splitAmong.length;
      const perPerson = splitCount > 0 ? item.amount / splitCount : 0;
      const itemTotal = item.amount;

      const row = [
        sub.name,
        item.name,
        item.amount.toFixed(2),
        item.paidBy,
        `"${item.splitAmong.join(", ")}"`,
        ...trip.friends.map((f) =>
          item.splitAmong.includes(f) ? perPerson.toFixed(2) : "0.00"
        ),
        itemTotal.toFixed(2),
      ];
      rows.push(row);
    });

    // Subtotal row
    const subtotalValue = Object.values(baseTotals).reduce((a, b) => a + b, 0);
    rows.push([
      sub.name,
      "[Subtotal]",
      "",
      "",
      "",
      ...trip.friends.map((f) => baseTotals[f].toFixed(2)),
      subtotalValue.toFixed(2),
    ]);

    // Tax row (only if non-zero)
    if (totalTax > 0) {
      rows.push([
        sub.name,
        `[Tax ${sub.taxPercent}%]`,
        "",
        "",
        "",
        ...trip.friends.map((f) => (totals[f] - baseTotals[f]).toFixed(2)),
        totalTax.toFixed(2),
      ]);
    }

    // Group total row
    const groupTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    rows.push([
      sub.name,
      "[Group Total]",
      "",
      "",
      "",
      ...trip.friends.map((f) => totals[f].toFixed(2)),
      groupTotal.toFixed(2),
    ]);

    // Empty separator row
    rows.push([]);

    // Accumulate grand totals
    trip.friends.forEach((f) => {
      grandTotals[f] += totals[f];
    });
    grandTotal += groupTotal;
  });

  // Grand total row
  rows.push([
    "Grand Total",
    "",
    "",
    "",
    "",
    ...trip.friends.map((f) => grandTotals[f].toFixed(2)),
    grandTotal.toFixed(2),
  ]);

  return rows.map((row) => row.join(",")).join("\n");
}

export function downloadDetailedCSV(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): void {
  const csv = generateDetailedCSV(trip, excludedSubTopicIds);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${trip.name.replace(/[^a-zA-Z0-9]/g, "_")}_detailed.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatSettlementsForWhatsApp(settlements: Settlement[]): string {
  if (settlements.length === 0) {
    return "All settled up!";
  }

  return settlements
    .map((s) => `${s.from} :- ₹${s.amount.toFixed(2)} -> ${s.to}`)
    .join("\n");
}
