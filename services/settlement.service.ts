import type {
  Trip,
  ExpenseGroup,
  Item,
  Settlement,
  SettlementResult,
  SettlementStep,
  SubTopicTotals,
} from "@/types";

export function calculateItemTaxDiscount(item: Item): {
  tax: number;
  discount: number;
} {
  const taxMode = item.taxMode || "percentage";
  let tax: number;
  if (taxMode === "value") {
    tax = item.taxValue || 0;
  } else {
    tax = item.amount * ((item.taxPercent || 0) / 100);
  }

  const afterTax = item.amount + tax;
  const discountMode = item.discountMode || "percentage";
  let discount: number;
  if (discountMode === "value") {
    discount = item.discountValue || 0;
  } else {
    discount = afterTax * ((item.discountPercent || 0) / 100);
  }

  return { tax, discount };
}

function calculateGroupLevelTotals(
  subTopic: ExpenseGroup,
  friends: string[]
): SubTopicTotals {
  const baseTotals: Record<string, number> = {};
  friends.forEach((f) => {
    baseTotals[f] = 0;
  });

  let subTopicTotal = 0;

  subTopic.items.forEach((item) => {
    const splitCount = item.splitAmong.length;
    if (splitCount === 0) return;
    const perPerson = item.amount / splitCount;
    item.splitAmong.forEach((person) => {
      if (baseTotals[person] !== undefined) {
        baseTotals[person] += perPerson;
      }
    });
    subTopicTotal += item.amount;
  });

  const taxMode = subTopic.taxMode || "percentage";
  let totalTax: number;
  if (taxMode === "value") {
    totalTax = subTopic.taxValue || 0;
  } else {
    const taxMultiplier = (subTopic.taxPercent || 0) / 100;
    totalTax = subTopicTotal * taxMultiplier;
  }

  const taxPerPerson: Record<string, number> = {};
  friends.forEach((f) => {
    if (subTopicTotal > 0) {
      taxPerPerson[f] = (baseTotals[f] / subTopicTotal) * totalTax;
    } else {
      taxPerPerson[f] = 0;
    }
  });

  const totalAfterTax = subTopicTotal + totalTax;
  const discountMode = subTopic.discountMode || "percentage";
  let totalDiscount: number;
  if (discountMode === "value") {
    totalDiscount = subTopic.discountValue || 0;
  } else {
    const discountMultiplier = (subTopic.discountPercent || 0) / 100;
    totalDiscount = totalAfterTax * discountMultiplier;
  }

  const discountPerPerson: Record<string, number> = {};
  const totals: Record<string, number> = {};

  friends.forEach((f) => {
    const personAfterTax = baseTotals[f] + taxPerPerson[f];
    if (totalAfterTax > 0) {
      discountPerPerson[f] = (personAfterTax / totalAfterTax) * totalDiscount;
    } else {
      discountPerPerson[f] = 0;
    }
    totals[f] = baseTotals[f] + taxPerPerson[f] - discountPerPerson[f];
  });

  return {
    totals,
    baseTotals,
    taxPerPerson,
    totalTax,
    discountPerPerson,
    totalDiscount,
    subTopicTotal,
  };
}

function calculateItemLevelTotals(
  subTopic: ExpenseGroup,
  friends: string[]
): SubTopicTotals {
  const baseTotals: Record<string, number> = {};
  const taxPerPerson: Record<string, number> = {};
  const discountPerPerson: Record<string, number> = {};
  const totals: Record<string, number> = {};

  friends.forEach((f) => {
    baseTotals[f] = 0;
    taxPerPerson[f] = 0;
    discountPerPerson[f] = 0;
    totals[f] = 0;
  });

  let subTopicTotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  subTopic.items.forEach((item) => {
    const splitCount = item.splitAmong.length;
    if (splitCount === 0) return;

    const perPerson = item.amount / splitCount;
    subTopicTotal += item.amount;

    const { tax: itemTax, discount: itemDiscount } =
      calculateItemTaxDiscount(item);
    totalTax += itemTax;
    totalDiscount += itemDiscount;

    const taxPerPersonForItem = itemTax / splitCount;
    const discountPerPersonForItem = itemDiscount / splitCount;
    const totalPerPersonForItem =
      perPerson + taxPerPersonForItem - discountPerPersonForItem;

    item.splitAmong.forEach((person) => {
      if (baseTotals[person] !== undefined) {
        baseTotals[person] += perPerson;
        taxPerPerson[person] += taxPerPersonForItem;
        discountPerPerson[person] += discountPerPersonForItem;
        totals[person] += totalPerPersonForItem;
      }
    });
  });

  return {
    totals,
    baseTotals,
    taxPerPerson,
    totalTax,
    discountPerPerson,
    totalDiscount,
    subTopicTotal,
  };
}

export function calculateSubTopicPersonTotals(
  subTopic: ExpenseGroup,
  friends: string[]
): SubTopicTotals {
  const level = subTopic.taxDiscountLevel || "group";
  if (level === "item") {
    return calculateItemLevelTotals(subTopic, friends);
  }
  return calculateGroupLevelTotals(subTopic, friends);
}

export function calculateSettlements(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): SettlementResult {
  const balances: Record<string, { owes: number; paid: number }> = {};
  trip.friends.forEach((f) => {
    balances[f] = { owes: 0, paid: 0 };
  });

  const includedSubTopics = trip.subTopics.filter(
    (sub) => !excludedSubTopicIds.includes(sub.id)
  );

  includedSubTopics.forEach((sub) => {
    const { totals } = calculateSubTopicPersonTotals(sub, trip.friends);

    // Each person owes their proportional total (base + proportional tax)
    trip.friends.forEach((f) => {
      balances[f].owes += totals[f];
    });

    // Track who paid
    const level = sub.taxDiscountLevel || "group";

    if (level === "item") {
      // Item-level: each payer paid item amount + item tax - item discount
      sub.items.forEach((item) => {
        if (balances[item.paidBy]) {
          const { tax: itemTax, discount: itemDiscount } =
            calculateItemTaxDiscount(item);
          balances[item.paidBy].paid +=
            item.amount + itemTax - itemDiscount;
        }
      });
    } else {
      // Group-level: distribute group tax/discount proportionally among payers
      sub.items.forEach((item) => {
        if (balances[item.paidBy]) {
          balances[item.paidBy].paid += item.amount;
        }
      });

      const subTotal = sub.items.reduce((s, i) => s + i.amount, 0);
      const { totalTax, totalDiscount } = calculateSubTopicPersonTotals(
        sub,
        trip.friends
      );

      if (subTotal > 0 && totalTax > 0) {
        sub.items.forEach((item) => {
          if (balances[item.paidBy]) {
            balances[item.paidBy].paid += (item.amount / subTotal) * totalTax;
          }
        });
      }

      const totalPaidBeforeDiscount = subTotal + totalTax;
      if (totalPaidBeforeDiscount > 0 && totalDiscount > 0) {
        sub.items.forEach((item) => {
          if (balances[item.paidBy]) {
            const payerShareOfTotal =
              (item.amount +
                (subTotal > 0 ? (item.amount / subTotal) * totalTax : 0)) /
              totalPaidBeforeDiscount;
            balances[item.paidBy].paid -= payerShareOfTotal * totalDiscount;
          }
        });
      }
    }
  });

  const nets: Record<string, number> = {};
  trip.friends.forEach((f) => {
    nets[f] = balances[f].paid - balances[f].owes;
  });

  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];
  trip.friends.forEach((f) => {
    if (nets[f] < -0.01) {
      debtors.push({ name: f, amount: -nets[f] });
    } else if (nets[f] > 0.01) {
      creditors.push({ name: f, amount: nets[f] });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  const steps: SettlementStep[] = [];

  // Track running balances for explanation
  const runningBalances: Record<string, number> = { ...nets };

  let i = 0;
  let j = 0;
  let stepNumber = 1;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.01) {
      const roundedAmount = Math.round(amount * 100) / 100;

      settlements.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: roundedAmount,
      });

      // Update running balances
      runningBalances[debtors[i].name] += roundedAmount;
      runningBalances[creditors[j].name] -= roundedAmount;

      // Record step for explanation
      steps.push({
        stepNumber,
        debtor: debtors[i].name,
        debtorAmount: -nets[debtors[i].name], // Original debt amount
        creditor: creditors[j].name,
        creditorAmount: nets[creditors[j].name], // Original credit amount
        settlementAmount: roundedAmount,
        balancesAfter: { ...runningBalances },
      });

      stepNumber++;
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return { balances, nets, settlements, steps };
}

export function calculateTotalSpentPerPerson(
  trip: Trip,
  excludedSubTopicIds: string[] = []
): Record<string, number> {
  const totals: Record<string, number> = {};
  trip.friends.forEach((f) => {
    totals[f] = 0;
  });

  const includedSubTopics = trip.subTopics.filter(
    (sub) => !excludedSubTopicIds.includes(sub.id)
  );

  includedSubTopics.forEach((sub) => {
    const { totals: subTotals } = calculateSubTopicPersonTotals(
      sub,
      trip.friends
    );
    trip.friends.forEach((f) => {
      totals[f] += subTotals[f];
    });
  });

  return totals;
}

export function findLowestSpender(
  totals: Record<string, number>
): string | null {
  const entries = Object.entries(totals);
  if (entries.length === 0) return null;

  let lowest = entries[0];
  for (const entry of entries) {
    if (entry[1] < lowest[1]) {
      lowest = entry;
    }
  }
  return lowest[0];
}
