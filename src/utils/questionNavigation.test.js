import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestionSequence, questionDisplayNumber, questionIndex } from "./questionNavigation.js";

test("direct-open mapping responses follow newest-first list order", () => {
  const rows = [{ questionId: 20 }, { questionId: 3 }, { questionId: 10 }];
  const sequence = buildQuestionSequence(rows, { questionId: 10 });
  assert.deepEqual(sequence.map((q) => q.questionId), [20, 10, 3]);
  const index = questionIndex(sequence, "10");
  assert.equal(sequence[index - 1].questionId, 20);
  assert.equal(sequence[index + 1].questionId, 3);
  assert.deepEqual(buildQuestionSequence([...rows].reverse(), { questionId: 10 }), sequence);
});

test("questions beyond 20 retain their actual position instead of jumping to index zero", () => {
  const rows = Array.from({ length: 35 }, (_, i) => ({ questionId: i + 1 }));
  const sequence = buildQuestionSequence(rows.reverse(), { questionId: 24 });
  const index = questionIndex(sequence, 24);
  assert.equal(sequence.length, 35);
  assert.equal(index, 11);
  assert.equal(sequence[index + 1].questionId, 23);
  assert.equal(sequence[index - 1].questionId, 25);
});

test("missing current question is inserted in its correct position with complete details", () => {
  const sequence = buildQuestionSequence([{ questionId: 20 }, { questionId: 3 }], { questionId: 10, pairs: [1] });
  assert.equal(questionIndex(sequence, 10), 1);
  assert.deepEqual(sequence[1].pairs, [1]);
});

test("inactive neighbors and duplicate IDs cannot create loops", () => {
  const sequence = buildQuestionSequence([
    { questionId: 3 }, { questionId: "3" }, { questionId: 4, activeRow: false },
    { questionId: 8, questionType: "JOURNAL" }, null,
  ], { questionId: 3, questionType: "MATCH_THE_FOLLOWING" });
  assert.equal(sequence.length, 2);
  assert.equal(sequence[0].questionId, 8);
});

test("first list question 20 has Next 19 and no Previous", () => {
  const sequence = buildQuestionSequence([], { questionId: 20, pairs: [1] }, [20, 19, 18]);
  const index = questionIndex(sequence, 20);
  assert.equal(index, 0);
  assert.equal(sequence[index - 1], undefined);
  assert.equal(sequence[index + 1].questionId, "19");
  assert.deepEqual(sequence[0].pairs, [1]);
});

test("filtered cross-topic list order survives navigating and refreshing", () => {
  const ids = [20, 17, 3, 17];
  const first = buildQuestionSequence([], { questionId: 20, topicId: 1 }, ids);
  const historyIds = first.map((row) => row.questionId);
  const next = buildQuestionSequence([], { questionId: 17, topicId: 2 }, historyIds);
  const refreshed = buildQuestionSequence([], { questionId: 17, topicId: 2 }, JSON.parse(JSON.stringify(historyIds)));
  assert.deepEqual(next, refreshed);
  assert.deepEqual(next.map((row) => String(row.questionId)), ["20", "17", "3"]);
  assert.equal(questionIndex(next, 17), 1);
  assert.equal(next[1].topicId, 2);
});

test("invalid or unrelated navigation state falls back to mapping", () => {
  const rows = [{ questionId: 20 }, { questionId: 17 }];
  for (const ids of [null, [], ["bad", 17], [20, -1, 17], [20]]) {
    assert.deepEqual(buildQuestionSequence(rows, { questionId: 17 }, ids), rows);
  }
});

test("first, last, single and unavailable questions have safe boundaries", () => {
  const sequence = buildQuestionSequence([], { questionId: 3 });
  assert.equal(questionIndex(sequence, 3), 0);
  assert.equal(sequence[1], undefined);
  assert.equal(sequence[-1], undefined);
  assert.equal(questionIndex(sequence, 99), -1);
  assert.deepEqual(buildQuestionSequence(null, null), []);
});

test("display number matches the filtered list, not the database ID or active-only position", () => {
  const rows = buildQuestionSequence([], { questionId: 20 }, [20, 17]);
  const listNumbers = { 20: 1, 19: 2, 17: 3 };
  assert.equal(questionDisplayNumber(rows, "20", listNumbers), 1);
  assert.equal(questionDisplayNumber(rows, "17", listNumbers), 3);
  const restoredNumbers = JSON.parse(JSON.stringify(listNumbers));
  assert.equal(questionDisplayNumber(rows, "17", restoredNumbers), 3);
  assert.equal(questionDisplayNumber(rows, "17"), 2);
  assert.equal(questionDisplayNumber(rows, "17", { 17: -1 }), 2);
});
