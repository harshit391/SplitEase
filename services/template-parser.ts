import type { ItemCreate } from "@/types";

export interface ParsedTemplate {
  groupName: string;
  items: ItemCreate[];
  tax?: { mode: "percentage" | "value"; percent: number; value: number };
  discount?: {
    mode: "percentage" | "value";
    percent: number;
    value: number;
  };
}

export interface ParseError {
  line: number;
  message: string;
}

export type ParseResult =
  | { success: true; data: ParsedTemplate }
  | { success: false; errors: ParseError[] };

const TAX_DISCOUNT_REGEX =
  /^(tax|discount)\s+is\s+(\d+(?:\.\d+)?)\s*(rs|%)\s*\.?$/i;

const ITEM_REGEX =
  /^(\d+(?:\.\d+)?)\s+for\s+(.+?)\s+paid\s+by\s+(.+?)\s+on\s+(.+?)\.?$/i;

function findFriend(name: string, friends: string[]): string | null {
  const trimmed = name.trim();
  const match = friends.find(
    (f) => f.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? null;
}

export function parseExpenseTemplate(
  text: string,
  friends: string[]
): ParseResult {
  const rawLines = text.split("\n");
  const lines: { text: string; originalIndex: number }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (trimmed.length > 0) {
      lines.push({ text: trimmed, originalIndex: i + 1 });
    }
  }

  if (lines.length === 0) {
    return { success: false, errors: [{ line: 1, message: "Template is empty" }] };
  }

  const groupName = lines[0].text;
  if (lines.length < 2) {
    return {
      success: false,
      errors: [{ line: 1, message: "Template must have at least a group name and one item" }],
    };
  }

  // Parse tax/discount lines from the end
  let tax: ParsedTemplate["tax"] = undefined;
  let discount: ParsedTemplate["discount"] = undefined;
  let itemEndIndex = lines.length;

  for (let i = lines.length - 1; i >= 1; i--) {
    const match = TAX_DISCOUNT_REGEX.exec(lines[i].text);
    if (!match) break;

    const keyword = match[1].toLowerCase();
    const amount = parseFloat(match[2]);
    const unit = match[3].toLowerCase();

    if (keyword === "tax") {
      if (tax) {
        return {
          success: false,
          errors: [{ line: lines[i].originalIndex, message: "Duplicate tax line" }],
        };
      }
      tax = {
        mode: unit === "%" ? "percentage" : "value",
        percent: unit === "%" ? amount : 0,
        value: unit === "rs" ? amount : 0,
      };
    } else {
      if (discount) {
        return {
          success: false,
          errors: [{ line: lines[i].originalIndex, message: "Duplicate discount line" }],
        };
      }
      discount = {
        mode: unit === "%" ? "percentage" : "value",
        percent: unit === "%" ? amount : 0,
        value: unit === "rs" ? amount : 0,
      };
    }

    itemEndIndex = i;
  }

  // Parse item lines
  const errors: ParseError[] = [];
  const items: ItemCreate[] = [];
  const itemLines = lines.slice(1, itemEndIndex);

  if (itemLines.length === 0) {
    errors.push({ line: lines[0].originalIndex, message: "No item lines found" });
    return { success: false, errors };
  }

  for (const line of itemLines) {
    const match = ITEM_REGEX.exec(line.text);
    if (!match) {
      errors.push({
        line: line.originalIndex,
        message: `Could not parse item. Expected format: "amount for friends paid by payer on itemName"`,
      });
      continue;
    }

    const amount = parseFloat(match[1]);
    const splitRaw = match[2].trim();
    const payerRaw = match[3].trim();
    const itemName = match[4].trim();

    if (amount <= 0) {
      errors.push({ line: line.originalIndex, message: "Amount must be greater than 0" });
      continue;
    }

    if (!itemName) {
      errors.push({ line: line.originalIndex, message: "Item name is required after \"on\"" });
      continue;
    }

    // Resolve paidBy
    const payer = findFriend(payerRaw, friends);
    if (!payer) {
      errors.push({
        line: line.originalIndex,
        message: `"${payerRaw}" is not a friend in this trip`,
      });
      continue;
    }

    // Resolve splitAmong
    let splitAmong: string[];
    if (splitRaw.toLowerCase() === "all") {
      splitAmong = [...friends];
    } else {
      const names = splitRaw.split(",").map((n) => n.trim());
      splitAmong = [];
      let hasError = false;
      for (const name of names) {
        const resolved = findFriend(name, friends);
        if (!resolved) {
          errors.push({
            line: line.originalIndex,
            message: `"${name}" is not a friend in this trip`,
          });
          hasError = true;
        } else {
          splitAmong.push(resolved);
        }
      }
      if (hasError) continue;
    }

    items.push({
      name: itemName,
      amount,
      paidBy: payer,
      splitAmong,
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: { groupName, items, tax, discount },
  };
}
