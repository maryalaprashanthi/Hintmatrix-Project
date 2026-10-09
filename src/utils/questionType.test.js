import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuestionType, isMatchingQuestionType, isFillBlankQuestionType,
  isTransactionQuestionType } from "./questionType.js";

test("matching routing uses names, not environment-specific IDs", () => {
  assert.equal(isMatchingQuestionType({ value: 24, label: "Match The Following" }), true);
  assert.equal(isMatchingQuestionType({ value: 6, label: "JOURNAL" }), false);
});
test("MCQ aliases normalize consistently", () => {
  assert.equal(normalizeQuestionType("MCQ Single Choice"), "SINGLE_CHOICE");
  assert.equal(normalizeQuestionType("MultipleChoice"), "MULTIPLE_CHOICE");
});
test("blank and transaction types route independently", () => {
  assert.equal(isFillBlankQuestionType("Fill-in-the-blanks"), true);
  assert.equal(isTransactionQuestionType("Dropdown Question"), true);
  assert.equal(isTransactionQuestionType("MCQ SINGLE CHOICE"), false);
  assert.equal(normalizeQuestionType({ name: "Journal" }), "JOURNAL");
});
