import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestionSequence, compareQuestionIds, getQuestionListPath, questionDisplayNumber, questionIndex } from "./questionNavigation.js";

test("direct-open mapping responses follow ascending question-ID list order", () => {
  const rows = [{ questionId: 20 }, { questionId: 3 }, { questionId: 10 }];
  const sequence = buildQuestionSequence(rows, { questionId: 10 });
  assert.deepEqual(sequence.map((q) => q.questionId), [3, 10, 20]);
  const index = questionIndex(sequence, "10");
  assert.equal(sequence[index - 1].questionId, 3);
  assert.equal(sequence[index + 1].questionId, 20);
  assert.deepEqual(buildQuestionSequence([...rows].reverse(), { questionId: 10 }), sequence);
});

test("questions beyond 20 retain their actual position instead of jumping to index zero", () => {
  const rows = Array.from({ length: 35 }, (_, i) => ({ questionId: i + 1 }));
  const sequence = buildQuestionSequence(rows.reverse(), { questionId: 24 });
  const index = questionIndex(sequence, 24);
  assert.equal(sequence.length, 35);
  assert.equal(index, 23);
  assert.equal(sequence[index + 1].questionId, 25);
  assert.equal(sequence[index - 1].questionId, 23);
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
  assert.equal(sequence[1].questionId, 8);
});

test("first list question 1 has Next 2 and no Previous", () => {
  const sequence = buildQuestionSequence([], { questionId: 1, pairs: [1] }, [1, 2, 3]);
  const index = questionIndex(sequence, 1);
  assert.equal(index, 0);
  assert.equal(sequence[index - 1], undefined);
  assert.equal(sequence[index + 1].questionId, "2");
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
    assert.deepEqual(buildQuestionSequence(rows, { questionId: 17 }, ids), [...rows].sort(compareQuestionIds));
  }
});

test("list ordering is numeric ascending regardless of creation dates or ID strings", () => {
  const rows = [
    { questionId: "20", createdAt: "2020-01-01" },
    { questionId: "2", createdAt: "2026-10-15" },
    { questionId: "10", createdAt: "2025-01-01" },
    { questionId: 1, createdAt: null },
  ];
  assert.deepEqual(rows.sort(compareQuestionIds).map((row) => String(row.questionId)), ["1", "2", "10", "20"]);
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

test("question breadcrumb returns to its source list even across topics and next/previous", () => {
  assert.equal(getQuestionListPath({ topicId: 1 }, { questionListPath: "/questions" }), "/questions");
  const state = { questionListPath: "/topics/5/questions" };
  assert.equal(getQuestionListPath({ topicId: 5 }, state), "/topics/5/questions");
  assert.equal(getQuestionListPath({ topicId: 8 }, JSON.parse(JSON.stringify(state))), "/topics/5/questions");
});

test("direct question links return to topic questions, never the topics list or an external URL", () => {
  assert.equal(getQuestionListPath({ topicId: 5 }), "/topics/5/questions");
  assert.equal(getQuestionListPath({ categoryId: 7 }), "/topics/7/questions");
  assert.equal(getQuestionListPath({}), "/questions");
  for (const source of ["https://example.test", "/chapters/5/topics", "/topics/undefined/questions", "/topics/0/questions"]) {
    assert.equal(getQuestionListPath({ topicId: 5 }, { questionListPath: source }), "/topics/5/questions");
  }
});
