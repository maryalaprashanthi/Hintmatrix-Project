export const data = [
  {
    name: "Trading Account",
    headers: ["Debit Particulars", "Credit Particulars"],
  },
  {
    name: "Profit & Loss Account",
    headers: ["Debit Particulars", "Credit Particulars"],
  },
  {
    name: "Balance Sheet",
    headers: ["Liabilities Side", "Asset Side"],
  },
];

// Accept display names from answers saved by older versions, while every new
// placement uses the canonical proforma above.
const normalizeName = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const canonicalTable = (name) => {
  const key = normalizeName(name);
  return data.find((table) => normalizeName(table.name) === key)?.name ?? name;
};
const canonicalHeader = (name) => {
  const key = normalizeName(name);
  if (["assets", "asset", "assetside"].includes(key)) return "Asset Side";
  if (
    ["liabilities", "liability", "liabilitiesside", "liabilityside"].includes(
      key,
    )
  )
    return "Liabilities Side";
  if (key === "debitparticulars") return "Debit Particulars";
  if (key === "creditparticulars") return "Credit Particulars";
  return name;
};

export const normalizeFinalAccountTarget = (target) => {
  const parts = String(target ?? "").split("-");
  if (parts.length < 2) return target;
  const operation = parts.length > 2 ? parts.pop().toLowerCase() : null;
  const header = parts.pop();
  const table = parts.join("-");
  return `${canonicalTable(table)}-${canonicalHeader(header)}${operation ? `-${operation === "subtract" ? "less" : operation}` : ""}`;
};

// Accounting prefixes affect display only; stored attribute names stay unchanged.
export const finalAccountParticular = (row, target) => {
  const name = String(row.name ?? "").trim();
  if (!name || row.isBlank) return "";
  const normalizedTarget = normalizeFinalAccountTarget(target);
  const isAccount =
    normalizedTarget.startsWith("Trading Account-") ||
    normalizedTarget.startsWith("Profit & Loss Account-");
  if (!isAccount) return name;
  const plainName = name.replace(/^(?:To\s+|By\s+|Less:\s*)/i, "");
  if (["less", "subtract"].includes(row.operation ?? row.arithmetic))
    return `Less: ${plainName}`;
  const prefix = normalizedTarget.endsWith("Credit Particulars") ? "By" : "To";
  return `${prefix} ${plainName}`;
};

// The existing drag/drop placements are the source of truth. Transfers only
// appear in the table view: they are never stored or submitted as answer rows.
export const calculateFinalAccounts = (droppableData = {}) => {
  const totals = {};
  const derivedRows = {};
  const warnings = [];
  let hasBalanceSheet = false;
  for (const table of data) {
    for (const header of table.headers) {
      const key = `${table.name}-${header}`;
      totals[key] = 0;
      derivedRows[key] = [];
    }
  }
  // Integer paise keep decimal rupees exact during addition and subtraction.
  const paise = (amount) => {
    if (amount == null || amount === "") return null;
    if (!/^\d+(?:\.\d{1,2})?$/.test(String(amount).trim())) return null;
    const number = Number(amount);
    const cents = Math.round(number * 100);
    if (!Number.isFinite(number) || number < 0 || !Number.isSafeInteger(cents))
      return null;
    return cents;
  };
  for (const [sourceKey, rows] of Object.entries(droppableData)) {
    const key = normalizeFinalAccountTarget(sourceKey);
    if (!(key in totals)) {
      if (rows?.length)
        warnings.push(`Unrecognized final account destination: ${sourceKey}`);
      continue;
    }
    for (const row of rows ?? []) {
      if (row.derived || row.isDerived) continue;
      const cents = paise(row.amount);
      const operation = String(
        row.operation ?? row.arithmetic ?? "",
      ).toLowerCase();
      if (cents == null || !["add", "less", "subtract"].includes(operation)) {
        warnings.push(
          `Check the amount and operation for ${row.name ?? "this account"}.`,
        );
        continue;
      }
      totals[key] += operation === "add" ? cents : -cents;
      if (!Number.isSafeInteger(totals[key]))
        throw new RangeError(
          "Final accounts total exceeds the supported amount range",
        );
      if (key.startsWith("Balance Sheet-")) hasBalanceSheet = true;
    }
  }
  const transfer = (key, name, cents, operation = "add") => {
    derivedRows[key].push({
      id: `derived-${key}-${name}`,
      name,
      amount: cents / 100,
      operation,
      isDerived: true,
      derived: true,
      isPaired: false,
    });
    totals[key] += operation === "less" ? -cents : cents;
    if (!Number.isSafeInteger(totals[key]))
      throw new RangeError(
        "Final accounts total exceeds the supported amount range",
      );
  };
  const tradingDebit = "Trading Account-Debit Particulars";
  const tradingCredit = "Trading Account-Credit Particulars";
  const pnlDebit = "Profit & Loss Account-Debit Particulars";
  const pnlCredit = "Profit & Loss Account-Credit Particulars";
  const liabilities = "Balance Sheet-Liabilities Side";
  const assets = "Balance Sheet-Asset Side";
  const gross = totals[tradingCredit] - totals[tradingDebit];
  const grossProfit = Math.max(gross, 0);
  const grossLoss = Math.max(-gross, 0);
  transfer(tradingDebit, "Gross Profit c/d", grossProfit);
  transfer(tradingCredit, "Gross Loss c/d", grossLoss);
  transfer(pnlDebit, "Gross Loss b/d", grossLoss);
  transfer(pnlCredit, "Gross Profit b/d", grossProfit);
  const net = totals[pnlCredit] - totals[pnlDebit];
  const netProfit = Math.max(net, 0);
  const netLoss = Math.max(-net, 0);
  transfer(pnlDebit, "Net Profit", netProfit);
  transfer(pnlCredit, "Net Loss", netLoss);
  transfer(liabilities, "Add: Net Profit", netProfit);
  transfer(liabilities, "Less: Net Loss", netLoss, "less");
  const difference = totals[assets] - totals[liabilities];
  const accounts = Object.fromEntries(
    data.map((table) => [
      table.name,
      Object.fromEntries(
        table.headers.map((header) => {
          const key = `${table.name}-${header}`;
          return [header, { rows: derivedRows[key], total: totals[key] / 100 }];
        }),
      ),
    ]),
  );
  return {
    accounts,
    derivedRows,
    grossResult: gross / 100,
    netResult: net / 100,
    balanceDifference: difference / 100,
    balanced: difference === 0,
    hasBalanceSheet,
    warnings,
  };
};
