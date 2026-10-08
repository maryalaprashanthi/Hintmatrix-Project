import test from "node:test";
import assert from "node:assert/strict";
import { restoreBlankAnswers, restoreMatchingAnswers, restoreMcqAnswer } from "./questionAttemptState.js";

test("blanks restore latest answers, wrong answers and partial saves", () => {
  const events = [
    { answerEventId: 2, eventType: "ANSWER", arithmetic: "FILL_IN_THE_BLANK", answerPosition: 1, userAnswer: "sales", isCorrect: true },
    { answerEventId: 1, eventType: "ANSWER", arithmetic: "FILL_IN_THE_BLANK", answerPosition: 1, userAnswer: "cash", isCorrect: false },
    { answerEventId: 3, activeRow: false, eventType: "ANSWER", arithmetic: "FILL_IN_THE_BLANK", answerPosition: 2, userAnswer: "old" },
  ];
  const partial = restoreBlankAnswers(events, 2);
  assert.deepEqual(partial.answers, ["sales", ""]);
  assert.equal(partial.submitted, false);
  const full = restoreBlankAnswers([...events, { answerEventId: 4, eventType: "ANSWER", arithmetic: "FILL_IN_THE_BLANK", answerPosition: 2, userAnswer: "wrong", isCorrect: false }], 2);
  assert.equal(full.submitted, true);
  assert.equal(full.score, 1);
});

test("matching restores source and target identities, including wrong matches", () => {
  const restored = restoreMatchingAnswers([
    { answerEventId: 1, eventType: "ANSWER", arithmetic: "MATCH", description: "Match | matchIds=[5,6]", isCorrect: false },
    { answerEventId: 2, eventType: "ANSWER", arithmetic: "MATCH", description: "Match | matchIds=[6,5]", isCorrect: false },
  ], [{ pairId: 5 }, { pairId: 6 }]);
  assert.deepEqual(restored.answers, { 5: 6, 6: 5 });
  assert.equal(restored.submitted, true);
  assert.equal(restored.score, 0);
});

test("matching never guesses missing legacy source IDs", () => {
  assert.deepEqual(restoreMatchingAnswers([{ eventType: "ANSWER", arithmetic: "MATCH", answerPosition: 5 }], [{ pairId: 5 }]).answers, {});
});

test("MCQ restores every selected option and the server result", () => {
  const options = [{ optionId: 10, isCorrect: true }, { optionId: 11, isCorrect: false }, { optionId: 12, isCorrect: true }];
  const restored = restoreMcqAnswer([{ eventType: "MCQ_ANSWER", description: "MCQ attempt | selectedOptionIds=[10, 11]", isCorrect: false }], options, true);
  assert.deepEqual(restored.selected, [10, 11]);
  assert.deepEqual(restored.result, { status: "WRONG", correctOptionIds: [10, 12] });
  assert.equal(restoreMcqAnswer([], options, true), null);
});

test("legacy single MCQ restores option ID, legacy multiple selections are not guessed", () => {
  const event = { eventType: "MCQ_ANSWER", optionId: 10, isCorrect: true };
  assert.deepEqual(restoreMcqAnswer([event], [{ optionId: 10 }], false).selected, [10]);
  assert.equal(restoreMcqAnswer([event], [{ optionId: 10 }], true), null);
});

test("removed options or reset events cannot restore a stale MCQ result", () => {
  assert.equal(restoreMcqAnswer([{ eventType: "MCQ_ANSWER", description: "selectedOptionIds=[99]" }], [{ optionId: 10 }], false), null);
  assert.equal(restoreMcqAnswer([{ activeRow: false, eventType: "MCQ_ANSWER", description: "selectedOptionIds=[10]" }], [{ optionId: 10 }], false), null);
});
