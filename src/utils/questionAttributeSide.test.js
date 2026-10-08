import test from "node:test";
import assert from "node:assert/strict";
import { getQuestionAttributeSide } from "./questionAttributeSide.js";

test("recognises debit and credit headers from Excel", () => {
  for (const headerName of ["Debit Particulars", " debit particulars ", "DEBIT BALANCES", "Debit", "debit_particulars"]) {
    assert.equal(getQuestionAttributeSide({ headerName, headerId: 6 }), "debit");
  }
  for (const headerName of ["Credit Particulars", " credit particulars ", "CREDIT BALANCES", "Credit", "credit_particulars"]) {
    assert.equal(getQuestionAttributeSide({ headerName, headerId: 5 }), "credit");
  }
});

test("header names override hardcoded IDs and stale transaction labels", () => {
  assert.equal(getQuestionAttributeSide({ headerName: "Debit Particulars", headerId: 3, transaction: "Credit" }), "debit");
  assert.equal(getQuestionAttributeSide({ headerName: "Credit Particulars", headerId: 1, transaction: "Debit" }), "credit");
});

test("unknown or missing headers are not silently treated as credit", () => {
  assert.equal(getQuestionAttributeSide({ headerName: "Adjustments", headerId: 3 }), null);
  assert.equal(getQuestionAttributeSide({}), null);
  assert.equal(getQuestionAttributeSide(null), null);
});

test("legacy edit header links use explicit attribute metadata", () => {
  assert.equal(getQuestionAttributeSide({ headerName: "transaction", attributeHeaderName: "debit particulars" }), "debit");
  assert.equal(getQuestionAttributeSide({ headerName: "liabilities side", attributeHeaderName: "credit particulars" }), "credit");
  assert.equal(getQuestionAttributeSide({ headerName: "Adjustments", attributeHeaderName: "Credit Particulars" }), null);
  assert.equal(getQuestionAttributeSide({ headerName: "transaction" }), null);
});

test("mixed uploaded attributes retain separate sides and totals", () => {
  const rows = [
    { headerName: " Debit Particulars ", amount: 10000 },
    { headerName: "DEBIT PARTICULARS", amount: 40000 },
    { headerName: "Debit Balances", amount: 5000 },
    { headerName: "Credit Particulars", amount: 70000 },
  ];
  const totals = rows.reduce((sum, row) => {
    sum[getQuestionAttributeSide(row)] += row.amount;
    return sum;
  }, { debit: 0, credit: 0 });
  assert.deepEqual(totals, { debit: 55000, credit: 70000 });
});
