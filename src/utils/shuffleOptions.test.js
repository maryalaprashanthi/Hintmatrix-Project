import test from "node:test";
import assert from "node:assert/strict";
import { shuffleOptions } from "./shuffleOptions.js";
import { restoreMcqAnswer } from "./questionAttemptState.js";

const options = Object.freeze([
  Object.freeze({ optionId: 11, optionText: "First", isCorrect: true }),
  Object.freeze({ optionId: 12, optionText: "Second", isCorrect: false }),
  Object.freeze({ optionId: 13, optionText: "Third", isCorrect: true }),
]);

test("shuffle changes display order without changing API data or answer identities", () => {
  const shuffled = shuffleOptions(options, () => 0);
  assert.deepEqual(shuffled.map((item) => item.optionId), [12, 13, 11]);
  assert.deepEqual(options.map((item) => item.optionId), [11, 12, 13]);
  assert.equal(shuffled[2], options[0]);
});

test("both single and multiple saved answers restore by ID after shuffling", () => {
  const shuffled = shuffleOptions(options, () => 0);
  for (const [multiple, selected] of [[false, [11]], [true, [11, 13]]]) {
    const restored = restoreMcqAnswer([{ answerEventId: 1, activeRow: true,
      eventType: "MCQ_ANSWER", isCorrect: true,
      description: `MCQ attempt | selectedOptionIds=${JSON.stringify(selected)}` }], shuffled, multiple);
    assert.deepEqual(restored.selected, selected);
    assert.deepEqual(restored.result.correctOptionIds.sort(), [11, 13]);
  }
});

test("empty, single, and string blank options remain intact", () => {
  assert.deepEqual(shuffleOptions([], () => 0), []);
  assert.deepEqual(shuffleOptions([options[0]], () => 0), [options[0]]);
  assert.deepEqual(shuffleOptions(["East", "West", "North"], () => 0), ["West", "North", "East"]);
});
