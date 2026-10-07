import test from "node:test";
import assert from "node:assert/strict";
import { calculateFinalAccounts, normalizeFinalAccountTarget } from "../src/components/Question/SampleData.js";

const tradingDebit = "Trading Account-Debit Particulars";
const tradingCredit = "Trading Account-Credit Particulars";
const pnlDebit = "Profit & Loss Account-Debit Particulars";
const pnlCredit = "Profit & Loss Account-Credit Particulars";
const assets = "Balance Sheet-Asset Side";
const liabilities = "Balance Sheet-Liabilities Side";
const row = (name, amount, operation = "add") => ({ id: name, name, amount, operation });

test("standard proforma nets returns, stock and expenses, carries both profits and reconciles capital", () => {
  const placements = {
    [tradingDebit]: [row("Opening Stock", 1000), row("Purchases", 8000), row("Purchase Returns", 500, "less"), row("Wages", 500)],
    [tradingCredit]: [row("Sales", 12000), row("Sales Returns", 1000, "less"), row("Closing Stock", 2000)],
    [pnlDebit]: [row("Salaries", 1500), row("Rent", 500)],
    [pnlCredit]: [row("Commission Received", 250)],
    [liabilities]: [row("Capital", 10000), row("Drawings", 1000, "less"), row("Creditors", 3000)],
    [assets]: [row("Cash", 10750), row("Debtors", 2000), row("Closing Stock", 2000)],
  };
  const original = structuredClone(placements);
  const result = calculateFinalAccounts(placements);
  assert.equal(result.grossResult, 4000); // 11,000 - (1,000 + 7,500 + 500 - 2,000)
  assert.equal(result.netResult, 2250);
  assert.equal(result.accounts["Trading Account"]["Debit Particulars"].total, 13000);
  assert.equal(result.accounts["Trading Account"]["Credit Particulars"].total, 13000);
  assert.equal(result.accounts["Profit & Loss Account"]["Debit Particulars"].total, 4250);
  assert.equal(result.accounts["Profit & Loss Account"]["Credit Particulars"].total, 4250);
  assert.equal(result.accounts["Balance Sheet"]["Liabilities Side"].total, 14250);
  assert.equal(result.balanceDifference, 500); // preserved discrepancy, no artificial asset/liability
  assert.equal(result.balanced, false);
  assert.equal(result.hasBalanceSheet, true);
  assert.deepEqual(placements, original);
});

test("gross loss and net loss balance on the correct sides and deduct from capital", () => {
  const result = calculateFinalAccounts({
    [tradingDebit]: [row("Costs", 7000)], [tradingCredit]: [row("Sales", 5000)],
    [pnlDebit]: [row("Expenses", 1000)], [pnlCredit]: [row("Income", 500)],
    [liabilities]: [row("Capital", 10000)], [assets]: [row("Assets", 7500)],
  });
  assert.equal(result.grossResult, -2000);
  assert.equal(result.netResult, -2500);
  assert.equal(result.derivedRows[tradingCredit][0].name, "Gross Loss c/d");
  assert.equal(result.derivedRows[pnlDebit][0].name, "Gross Loss b/d");
  assert.equal(result.derivedRows[pnlCredit][0].name, "Net Loss transferred to Capital");
  assert.equal(result.derivedRows[liabilities][0].operation, "less");
  assert.equal(result.accounts["Balance Sheet"]["Liabilities Side"].total, 7500);
  assert.equal(result.balanced, true);
});

test("other income may turn a gross loss into net profit", () => {
  const result = calculateFinalAccounts({
    [tradingDebit]: [row("Costs", 300)], [tradingCredit]: [row("Sales", 100)],
    [pnlCredit]: [row("Income", 500)], [pnlDebit]: [row("Expenses", 50)],
  });
  assert.equal(result.grossResult, -200);
  assert.equal(result.netResult, 250);
  assert.equal(result.derivedRows[liabilities][0].operation, "add");
  assert.equal(result.hasBalanceSheet, false);
});

test("gross profit may turn into net loss", () => {
  const result = calculateFinalAccounts({
    [tradingCredit]: [row("Sales", 500)], [tradingDebit]: [row("Costs", 200)],
    [pnlDebit]: [row("Expenses", 400)],
  });
  assert.equal(result.grossResult, 300);
  assert.equal(result.netResult, -100);
  assert.equal(result.derivedRows[liabilities][0].amount, 100);
});

test("decimal sums, repeated accounts, resets and rerenders do not accumulate transfers", () => {
  const result = calculateFinalAccounts({
    [tradingCredit]: [row("Sales-1", "0.10"), row("Sales-2", "0.20")],
    [tradingDebit]: [row("Costs", "0.10")],
  });
  assert.equal(result.grossResult, 0.20);
  const rerender = calculateFinalAccounts({
    [tradingCredit]: [row("Sales-1", "0.10"), row("Sales-2", "0.20")],
    [tradingDebit]: [row("Costs", "0.10"), ...result.derivedRows[tradingDebit]],
  });
  assert.equal(rerender.grossResult, result.grossResult);
  const reset = calculateFinalAccounts({});
  assert.equal(reset.grossResult, 0);
  assert.equal(reset.netResult, 0);
  assert.equal(reset.hasBalanceSheet, false);
  assert.deepEqual(reset.derivedRows[tradingDebit], []);
});

test("old saved names normalize without silently accepting arbitrary destinations", () => {
  assert.equal(normalizeFinalAccountTarget("Profit and Loss Account-Debit Particulars-add"), `${pnlDebit}-add`);
  assert.equal(normalizeFinalAccountTarget("Balance Sheet-assets-less"), `${assets}-less`);
  const result = calculateFinalAccounts({
    "Profit and Loss Account-Debit Particulars": [row("Rent", 50)],
    "Balance Sheet-liabilities side": [row("Capital", 50)],
    "Balance Sheet-assets": [row("Cash", 0)],
    "Unknown-Debit Particulars": [row("Unknown", 100)],
  });
  assert.equal(result.netResult, -50);
  assert.equal(result.balanced, true);
  assert.equal(result.warnings.length, 1);
});

test("invalid money and operations are reported instead of contaminating totals", () => {
  const result = calculateFinalAccounts({ [tradingCredit]: [
    row("Bad", "oops"), row("Negative", -1), row("Too precise", "1.234"), row("Bad operation", 10, "divide"),
  ] });
  assert.equal(result.grossResult, 0);
  assert.equal(result.warnings.length, 4);
});

test("a configured two-sided adjustment changes expenses and liabilities together", () => {
  const result = calculateFinalAccounts({
    [tradingCredit]: [row("Sales", 5000)],
    [pnlDebit]: [row("Salaries", 1000), row("Outstanding salaries adjustment", 200)],
    [liabilities]: [row("Capital", 1000), row("Outstanding salaries adjustment", 200)],
    [assets]: [row("Cash", 5000)],
  });
  assert.equal(result.netResult, 3800);
  assert.equal(result.accounts["Balance Sheet"]["Liabilities Side"].total, 5000);
  assert.equal(result.balanced, true);
});
