import test from "node:test";
import assert from "node:assert/strict";
import { emptyAdjustmentForm, buildAdjustmentAttributes, hydrateAdjustmentForm, validateAdjustmentForm } from "./adjustmentQuestionForm.js";

const headers = [{ headerId: 31, name: "Debit Particulars" }, { headerId: 74, name: "Credit Particulars" }];
const attributes = [{ attributeId: 4, name: "Rent", tableHeaderName: "Debit Particulars" },
  { attributeId: 8, name: "Sales", tableHeaderName: "Credit Particulars" },
  { attributeId: 12, name: "Outstanding Rent", tableHeaderName: "Credit Particulars" }];
const form = () => ({ balances: [{ debitAttributeId: "4", debitAmount: "100", creditAttributeId: "8", creditAmount: "250" }],
  adjustments: [{ attributeId: "12", amount: "20", amount2: "10", note: "Rent unpaid" }] });

test("creation combines the separate tables into the existing question-attributes API", () => {
  const payload = buildAdjustmentAttributes(form(), attributes, headers);
  assert.deepEqual(payload.map((row) => row.headerId), [31, 74, 74]);
  assert.deepEqual(payload.map((row) => row.adjustment), [false, false, true]);
  assert.deepEqual(payload[2], { attributeId: 12, headerId: 74, amount: 20, amount2: 10, note: "Rent unpaid", adjustment: true });
  assert.deepEqual(validateAdjustmentForm(form(), attributes, headers), []);
});
test("reopening keeps an adjustment in its own table despite its credit header", () => {
  const questionAttributes = buildAdjustmentAttributes(form(), attributes, headers)
    .map((row) => ({ ...row, headerName: headers.find((header) => header.headerId === row.headerId).name }));
  const restored = hydrateAdjustmentForm({ questionAttributes });
  assert.equal(restored.balances.length, 1);
  assert.equal(restored.adjustments[0].attributeId, 12);
  assert.equal(restored.adjustments[0].note, "Rent unpaid");
  assert.equal(restored.adjustments[0].amount2, 10);
  assert.deepEqual(buildAdjustmentAttributes(restored, attributes, headers), buildAdjustmentAttributes(form(), attributes, headers));
});
test("form rejects missing accounts, invalid amounts, wrong balance sides and unresolved headers", () => {
  assert.ok(validateAdjustmentForm(emptyAdjustmentForm(), attributes, headers).length >= 2);
  const invalid = form(); invalid.adjustments[0].amount = "";
  assert.ok(validateAdjustmentForm(invalid, attributes, headers).some((error) => error.includes("adjustment amounts")));
  invalid.adjustments[0].amount = "20.123";
  assert.ok(validateAdjustmentForm(invalid, attributes, headers).length);
  const wrongSide = form(); wrongSide.balances[0].debitAttributeId = "8";
  assert.ok(validateAdjustmentForm(wrongSide, attributes, headers).some((error) => error.includes("debit side")));
  assert.throws(() => buildAdjustmentAttributes(form(), attributes, []), /database header/);
});
