import test from "node:test";
import assert from "node:assert/strict";
import { BLANK_KEY, MATCH_KEY, wordAnswerLines } from "./examWordAnswers.js";
import { questionTypeOf } from "./questionTypeOf.js";
import { questionTypeOf as mockQuestionTypeOf } from "../../MockExam/ExamComponents/questionTypeOf.js";

test("submission lines carry the key and the trimmed text only", () => {
  const lines = wordAnswerLines(
    [
      { pairId: "10", answerText: " Asset " },
      { pairId: 11, answerText: "" },
    ],
    MATCH_KEY,
  );

  assert.deepEqual(lines, [
    { answeredData: { pairId: 10, answerText: "Asset" } },
  ]);
});

test("an unanswered question sends no lines", () => {
  assert.deepEqual(wordAnswerLines(undefined, BLANK_KEY), []);
  assert.deepEqual(wordAnswerLines(null, BLANK_KEY), []);
  assert.deepEqual(wordAnswerLines([{ answerText: "Debit" }], BLANK_KEY), []);
});

test("fill-in-the-blank lines use the blank number", () => {
  assert.deepEqual(
    wordAnswerLines([{ blankNumber: 2, answerText: "Credit" }], BLANK_KEY),
    [{ answeredData: { blankNumber: 2, answerText: "Credit" } }],
  );
});

test("both type helpers know the stored type names", () => {
  for (const typeOf of [questionTypeOf, mockQuestionTypeOf]) {
    assert.equal(typeOf("MATCH_THE_FOLLOWING"), "MATCHING");
    assert.equal(
      typeOf({ questionType: "FILL_IN_THE_BLANKS" }),
      "FILL_IN_THE_BLANK",
    );
    assert.equal(typeOf("Drag And Drop"), "DRAG_AND_DROP");
    assert.equal(typeOf("MCQ Single Choice"), "SINGLE_CHOICE");
  }
});
