import test from "node:test";
import assert from "node:assert/strict";
import { adjustmentTypeForChapter, modalBalanceRows, updateModalBalanceRows } from "./addQuestionDragDropForm.js";

test("adjustment chapter defaults to the actual API type option rather than an assumed ID", () => {
  const options = [{ value: 7, label: "Drag And Drop" }, { value: 93, label: "DRAG AND DROP WITH ADJ" }];
  assert.equal(adjustmentTypeForChapter("Final Accounts with Adjustments", options), options[1]);
  assert.equal(adjustmentTypeForChapter("Final Accounts without Adjustments", options), null);
  assert.equal(adjustmentTypeForChapter("Final Accounts with Adjustments", options.slice(0, 1)), null);
});

test("the modal adapter preserves manual amounts and saved metadata with the shared editor", () => {
  const original = { attributeId: 4, headerId: 31 };
  const rows = [{ debitBalance: 4, debitAmount: "100", creditBalance: "", creditAmount: "", debitOriginal: original }];
  const canonical = modalBalanceRows(rows);
  assert.equal(canonical[0].debitAttributeId, 4);
  const edited = updateModalBalanceRows(rows, (current) => current.map((row) => ({ ...row, debitAmount: "125" })), []);
  assert.equal(edited[0].debitBalance, 4); assert.equal(edited[0].debitAmount, "125");
  assert.equal(edited[0].debitOriginal, original);
  assert.equal(rows[0].debitAmount, "100");
});

test("shared modal rows retain account amount defaults, clearing, deletion and adding", () => {
  const rows = [{ debitBalance: 4, debitAmount: "100", creditBalance: "", creditAmount: "" },
    { debitBalance: 8, debitAmount: "20", creditBalance: "", creditAmount: "" }];
  const options = [{ value: 9, label: "Wages", amount: 0 }];
  const changed = updateModalBalanceRows(rows, (current) => [{ ...current[1], debitAttributeId: 9 }], options);
  assert.equal(changed.length, 1); assert.equal(changed[0].debitBalance, 9);
  assert.equal(changed[0].debitAmount, 0); assert.equal(changed[0].debitAttributeName, "Wages");
  const cleared = updateModalBalanceRows(changed, (current) => [{ ...current[0], debitAttributeId: "" }], options);
  assert.equal(cleared[0].debitAmount, "");
  const added = updateModalBalanceRows(cleared, (current) => [...current,
    { debitAttributeId: "", debitAmount: "", creditAttributeId: "", creditAmount: "" }], options);
  assert.equal(added.length, 2); assert.equal(added[1].debitBalance, "");
});
