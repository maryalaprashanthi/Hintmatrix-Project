import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { adjustmentRows, adjustmentTableRows, matchAdjustmentEffect, placementKey, addAdjustmentExamPlacement, displayAdjustmentAmount } from "./adjustmentPlacement.js";
import { normalizeQuestionType } from "../../utils/questionType.js";
import { questionTypeOf } from "../Exam/ExamComponents/questionTypeOf.js";
import { questionTypeOf as mockTypeOf } from "../MockExam/ExamComponents/questionTypeOf.js";
import { data, normalizeFinalAccountTarget } from "./SampleData.js";

test("adjustment aliases route separately across practice, exam and mock exam", () => {
  for (const name of ["dragAndDropWithAdj", "Drag And Drop With Adj", "DRAG_AND_DROP_WITH_ADJ"]) {
    assert.equal(normalizeQuestionType(name), "DRAG_AND_DROP_WITH_ADJ");
    assert.equal(questionTypeOf({ questionType: name }), "DRAG_AND_DROP_WITH_ADJ");
    assert.equal(mockTypeOf({ questionType: { name } }), "DRAG_AND_DROP_WITH_ADJ");
  }
  assert.equal(questionTypeOf("Drag And Drop"), "DRAG_AND_DROP");
});

const effects = [
  { conditionId: 1, answer: "Trading Account-Credit Particulars-add", amount: 200 },
  { conditionId: 2, answer: "Balance Sheet-Asset Side-add", amount: 70 },
];
test("each effect validates its own position and amount and cannot be reused", () => {
  assert.equal(matchAdjustmentEffect(effects, [], 11, effects[0].answer, 200), effects[0]);
  assert.equal(matchAdjustmentEffect(effects, [], 11, effects[1].answer, 200), undefined);
  assert.equal(matchAdjustmentEffect(effects, [], 11, "Trading Account-Debit Particulars-add", 200), undefined);
  const saved = [{ key: placementKey(11, 1) }];
  assert.equal(matchAdjustmentEffect(effects, saved, 11, effects[0].answer, 200), undefined);
  assert.equal(matchAdjustmentEffect(effects, saved, 11, effects[1].answer, 70), effects[1]);
  assert.equal(matchAdjustmentEffect(effects, saved, 12, effects[0].answer, 200), effects[0]);
});
test("account row identity, adjustment notes and both amounts survive normalization", () => {
  const rows = adjustmentRows({ questionAttributes: [
    { questionAttributeId: 11, attributeId: 8, attributeName: "Closing Stock", amount: 200, amount2: 70, note: "At cost" },
    { questionAttributeId: 12, attributeId: 8, attributeName: "Closing Stock", amount: 300 },
    { questionAttributeId: 13, activeRow: false },
  ] });
  assert.deepEqual(rows.map((row) => row.id), [11, 12]);
  assert.equal(rows[0].note, "At cost");
  assert.equal(rows[0].amount2, 70);
});

// Exercise the component's actual persistence handler with service doubles.
const source = readFileSync(new URL("./DragAndDropWithAdj.jsx", import.meta.url), "utf8");
const start = source.indexOf("const place = async ") + "const place = ".length;
const end = source.indexOf("// UI actions", start);
const handler = source.slice(start, source.lastIndexOf("\n", end)).trim().replace(/;$/, "");
function fixture({ correct = true, failSave = false, exam = false, hint = false, staleEvent = false, target = effects[0].answer,
  selectedAmount, configuredEffects = { 11: effects }, answered = [], marks = 1, scoreFails = false, totalScore = 101 } = {}) {
  const saved = [], recorded = [], placed = [], feedback = [], wrong = [], busy = [];
  const scores = [100];
  const context = {
    lock: { current: false }, loading: false, rows: [{ id: 11, attributeId: 8, name: "Closing Stock" }],
    effects: configuredEffects, amounts: { 11: 200 }, exam, placements: answered, target, selectedAmount,
    usedHints: { 11: hint }, setWrongAttempts: (update) => wrong.push(update({})), setActionErrors: () => {},
    matchAdjustmentEffect, placementKey, addAdjustmentExamPlacement, normalizeFinalAccountTarget, selected: null, questionId: 9,
    setFeedback: (text) => feedback.push(text), setBusy: (value) => busy.push(value), generation: { current: 1 },
    setScore: (value) => scores.push(typeof value === "function" ? value(scores.at(-1)) : value),
    getCurrentUserId: () => 4,
    QuestionAnswerService: {
      processAnswerEvent: async (body) => { recorded.push(body); if (staleEvent) context.generation.current++; return { isCorrect: correct, marks }; },
      saveAnswer: async (body) => { if (failSave) throw new Error("Save failed"); saved.push(body); },
      getOverallMarks: async () => { if (scoreFails) throw new Error("Score unavailable"); return totalScore; },
    },
    setPlacements: (update) => placed.push(...update([])),
    examStore: { setState: (update) => {
      const slice = update({ byQuestionId: { 9: { questions: [{ id: 11 }], droppableData: { "Trading Account-Credit Particulars": [] } } } });
      placed.push(...slice.byQuestionId[9].droppableData["Trading Account-Credit Particulars"]);
    } },
  };
  const run = new Function(...Object.keys(context), `return (${handler})(11, target, selectedAmount);`);
  return { run: () => run(...Object.values(context)), saved, recorded, placed, feedback, wrong, busy, context, scores };
}
test("the score immediately uses server marks for first, second and later correct attempts", async () => {
  for (const marks of [1, 0.5, 0]) {
    const f = fixture({ marks, scoreFails: true }); await f.run();
    assert.equal(f.scores.at(-1), 100 + marks);
    assert.equal(f.saved.length, 1); assert.equal(f.context.lock.current, false);
  }
});
test("score reconciliation uses the overall total without counting the awarded marks twice", async () => {
  const f = fixture({ marks: 0.5, totalScore: 100.5 }); await f.run();
  assert.deepEqual(f.scores, [100, 100.5, 100.5]);
});
test("a committed scored event updates the total even when its placement save fails", async () => {
  const f = fixture({ failSave: true, scoreFails: true, marks: 0.5 }); await f.run();
  assert.equal(f.scores.at(-1), 100.5); assert.equal(f.placed.length, 0);
});
test("wrong and assisted zero-mark responses cannot increase the score", async () => {
  for (const options of [{ correct: false }, { hint: true }]) {
    const f = fixture({ ...options, marks: 0, scoreFails: true }); await f.run();
    assert.equal(f.scores.at(-1), 100);
  }
});
test("a wrong second-amount placement records the second effect's attempt identity", async () => {
  const f = fixture({ correct: false, marks: 0, target: "Profit & Loss Account-Debit Particulars-add", selectedAmount: 70 });
  await f.run();
  assert.equal(f.recorded[0].conditionId, 2); assert.equal(f.recorded[0].answerPosition, 2);
});
test("repeating a saved effect does not consume another effect's scoring attempt", async () => {
  const f = fixture({ answered: [{ key: placementKey(11, 1) }] }); await f.run();
  assert.equal(f.recorded.length, 0); assert.equal(f.saved.length, 0);
});
test("practice saves a validated effect using existing event and answer APIs", async () => {
  const f = fixture(); await f.run();
  assert.equal(f.saved.length, 1); assert.equal(f.placed.length, 1);
  assert.equal(f.recorded[0].questionAttributeId, 11);
  assert.equal(f.recorded[0].answerPosition, 1);
  assert.equal(f.saved[0].totalAnswers, 2);
});
test("dragging a second amount validates and saves that amount independently", async () => {
  const f = fixture({ target: effects[1].answer, selectedAmount: 70 }); await f.run();
  assert.equal(f.recorded[0].amount, 70); assert.equal(f.recorded[0].answerPosition, 2);
  assert.equal(f.saved[0].amount, 70); assert.equal(f.saved[0].conditionId, 2);
});
test("a missing rule neither displays a configuration message nor saves an unvalidated drop", async () => {
  const f = fixture({ configuredEffects: {} }); await f.run();
  assert.equal(f.feedback.length, 0); assert.equal(f.recorded.length, 0);
  assert.equal(f.saved.length, 0); assert.equal(f.placed.length, 0);
});

test("amount display stays usable before rules load and never renders NaN", () => {
  for (const missing of [undefined, null, "", "invalid", NaN]) assert.equal(displayAdjustmentAmount(missing), "Amount unavailable");
  assert.equal(displayAdjustmentAmount(7425), "₹7,425");
  assert.equal(displayAdjustmentAmount(0), "₹0");
});
test("server rejection and failed saves never display a successful placement", async () => {
  const rejected = fixture({ correct: false }); await rejected.run();
  assert.equal(rejected.saved.length, 0); assert.equal(rejected.placed.length, 0);
  assert.equal(rejected.wrong[0][11], 1);
  const failed = fixture({ failSave: true }); await failed.run();
  assert.equal(failed.placed.length, 0); assert.ok(failed.feedback.includes("Save failed"));
});
test("a response from a previous question cannot save an answer or unlock a newer action", async () => {
  const f = fixture({ staleEvent: true }); await f.run();
  assert.equal(f.recorded.length, 1); assert.equal(f.saved.length, 0); assert.equal(f.placed.length, 0);
  assert.equal(f.context.lock.current, true); assert.deepEqual(f.busy, [true]);
});
test("a corrected answer after Hint uses the existing zero-credit HINT event and clears the red tile", async () => {
  const f = fixture({ hint: true }); await f.run();
  assert.equal(f.recorded[0].eventType, "HINT");
  assert.equal(f.saved.length, 1);
  assert.equal(f.wrong.at(-1)[11], 0);
});
test("exam places the student's selected amount in the paper store without practice API calls", async () => {
  const f = fixture({ exam: true }); await f.run();
  assert.equal(f.recorded.length, 0);
  assert.equal(f.placed[0].questionAttributeId, 11);
  assert.equal(f.placed[0].amount, 200);
  assert.equal(f.saved.length, 0);
});
test("exam effects sharing one destination stay distinct and respect the configured count", () => {
  const target = "Trading Account-Credit Particulars-add";
  const row = { id: 11, attributeId: 8, name: "Adjustment" };
  const initial = { questions: [row], droppableData: { "Trading Account-Credit Particulars": [] } };
  const first = addAdjustmentExamPlacement(initial, row, target, 200, 2);
  const second = addAdjustmentExamPlacement(first, row, target, 70, 2);
  assert.deepEqual(second.droppableData["Trading Account-Credit Particulars"].map((entry) => entry.amount), [200, 70]);
  assert.equal(new Set(second.droppableData["Trading Account-Credit Particulars"].map((entry) => entry.placementId)).size, 2);
  assert.equal(addAdjustmentExamPlacement(second, row, target, 90, 2), second);
  assert.equal(initial.droppableData["Trading Account-Credit Particulars"].length, 0);
});
test("exam placements preserve Rule Engine pairing without replacing student destinations", () => {
  const row = { id: 11, attributeId: 8, name: "Outstanding Rent" };
  const target = "Balance Sheet-Asset Side-less";
  const initial = { questions: [row], droppableData: { "Balance Sheet-Asset Side": [] } };
  const updated = addAdjustmentExamPlacement(initial, row, target, 200, 2, 19);
  assert.equal(updated.droppableData["Balance Sheet-Asset Side"][0].pairId, 19);
  assert.equal(updated.droppableData["Balance Sheet-Asset Side"][0].targetId, target);
});

test("adjustment proforma groups both additions and deductions using database pair IDs", () => {
  const target = "Profit & Loss Account-Debit Particulars";
  const input = [
    { id: 12, attributeId: 9, pairId: 8, name: "Outstanding Rent", amount: 200, operation: "add", target: `${target}-add`, key: "12:1" },
    { id: 13, attributeId: 10, pairId: 8, name: "Prepaid Rent", amount: 100, operation: "less", target: `${target}-less`, key: "13:1" },
    { id: 11, attributeId: 8, pairId: 8, name: "Rent", amount: 1000, operation: "add", target: `${target}-add`, key: "11:1" },
  ];
  const grouped = adjustmentTableRows(input)[target];
  assert.ok(grouped.every((row) => row.groupId === "11:1"));
  assert.deepEqual(grouped.map((row) => row.isGroupBase), [false, false, true]);
  assert.ok(input.every((row) => row.groupId === undefined));
});

test("grouping cannot cross statement sides or guess among repeated base account rows", () => {
  const target = "Profit & Loss Account-Debit Particulars";
  const input = [
    { id: 11, attributeId: 8, operation: "add", target: `${target}-add`, key: "11:1" },
    { id: 12, attributeId: 8, operation: "add", target: `${target}-add`, key: "12:1" },
    { id: 13, attributeId: 9, pairId: 8, operation: "add", target: `${target}-add`, key: "13:1" },
    { id: 14, attributeId: 9, pairId: 8, operation: "add", target: "Balance Sheet-Liabilities Side-add", key: "14:2" },
  ];
  const tables = adjustmentTableRows(input);
  assert.ok(Object.values(tables).flat().every((row) => row.groupId === undefined));
  const singleBase = adjustmentTableRows(input.filter((row) => row.id !== 12));
  assert.ok(singleBase[target].every((row) => row.groupId === "11:1"));
  assert.equal(singleBase["Balance Sheet-Liabilities Side"][0].groupId, undefined);
});

const autoStart = source.indexOf("const autoFill = async ") + "const autoFill = ".length;
const autoHandler = source.slice(autoStart, source.indexOf("\n  const reset =", autoStart)).trim().replace(/;$/, "");
function autoFixture({ answered = [], failCondition = null, failEvent = false, scoreFails = false, missingRule = false } = {}) {
  const saved = [], events = [], placed = [], errors = [], order = [], busy = [];
  const configured = effects.map((effect, index) => ({ ...effect, tableNameId: index + 1, headerId: index + 2 }));
  const context = {
    lock: { current: false }, loading: false, exam: false, question: { chapterId: 4 }, questionId: 9,
    rows: [{ id: 11, attributeId: 8, name: "Closing Stock" }], generation: { current: 1 },
    placements: answered.map((conditionId) => ({ key: placementKey(11, conditionId) })),
    data, placementKey, normalizeFinalAccountTarget, getRuleAnswers: () => {
      if (missingRule) throw new Error("No active rule is configured for this account in the chapter.");
      return configured;
    }, console: { warn() {} },
    RuleEngineService: { getAttributeAnswers: async () => [] }, getCurrentUserId: () => 4,
    setBusy: (value) => busy.push(value), setAutoFilling() {}, setEffects() {}, setWrongAttempts() {}, setScore() {},
    setFeedback: (message) => errors.push(message), setActionErrors: (update) => errors.push(update({})[11]),
    setPlacements: (update) => { const next = update(placed); placed.splice(0, placed.length, ...next); },
    QuestionAnswerService: {
      processAnswerEvent: async (event) => { if (failEvent) throw new Error("Event failed"); events.push(event); order.push(`event:${event.conditionId}`); },
      saveAnswer: async (answer) => { if (answer.conditionId === failCondition) throw new Error("Save failed"); saved.push(answer); order.push(`save:${answer.conditionId}`); },
      getOverallMarks: async () => { if (scoreFails) throw new Error("Score failed"); return 0; },
    },
  };
  const run = new Function(...Object.keys(context), `return (${autoHandler})(11);`);
  return { run: () => run(...Object.values(context)), saved, events, placed, errors, order, busy, context };
}
test("adjustment Auto Fill records zero-credit events and saves every remaining rule effect with its own amount", async () => {
  const f = autoFixture(); await f.run();
  assert.deepEqual(f.saved.map((entry) => entry.amount), [200, 70]);
  assert.deepEqual(f.order, ["event:1", "save:1", "event:2", "save:2"]);
  assert.ok(f.events.every((entry) => entry.eventType === "AUTOFILL" && entry.questionAttributeId === 11 && entry.answerPosition === entry.conditionId));
  assert.ok(f.saved.every((entry) => entry.totalAnswers === 2 && entry.questionAttributeId === 11));
  assert.equal(new Set(f.placed.map((entry) => entry.key)).size, 2);
});
test("adjustment Auto Fill skips saved effects and preserves placements if score refresh fails", async () => {
  const f = autoFixture({ answered: [1], scoreFails: true }); await f.run();
  assert.equal(f.saved.length, 1); assert.equal(f.saved[0].conditionId, 2);
  assert.equal(f.placed[0].amount, 70);
});
test("adjustment Auto Fill shows only persisted effects after a partial save failure and releases the action lock", async () => {
  const f = autoFixture({ failCondition: 2 }); await f.run();
  assert.equal(f.saved.length, 1); assert.equal(f.placed.length, 1);
  assert.equal(f.placed[0].conditionId, 1); assert.ok(f.errors.includes("Save failed"));
  assert.equal(f.context.lock.current, false); assert.equal(f.busy.at(-1), false);
});
test("a failed Auto Fill event never saves or displays an unmarked assisted answer", async () => {
  const f = autoFixture({ failEvent: true }); await f.run();
  assert.equal(f.saved.length, 0); assert.equal(f.placed.length, 0);
  assert.ok(f.errors.includes("Event failed"));
});
test("Auto Fill keeps missing-rule diagnostics out of student feedback and saves nothing", async () => {
  const f = autoFixture({ missingRule: true }); await f.run();
  assert.equal(f.events.length, 0); assert.equal(f.saved.length, 0); assert.equal(f.placed.length, 0);
  assert.deepEqual(f.errors.filter(Boolean), []);
  assert.equal(f.context.lock.current, false);
});

const loadStart = source.indexOf("const load = async ") + "const load = ".length;
const loadHandler = source.slice(loadStart, source.indexOf("\n    load().catch", loadStart)).trim().replace(/;$/, "");
test("reopening restores saved effect identities, pairing, amounts and the current total score", async () => {
  const restored = [], scores = [], loaded = [];
  const question = { questionId: 9, chapterId: 4, questionAttributes: [
    { questionAttributeId: 11, attributeId: 8, attributeName: "Outstanding Rent", amount: 200 },
  ] };
  const context = {
    question, questionId: 9, version: 1, generation: { current: 1 }, exam: false,
    adjustmentRows, placementKey, data, normalizeFinalAccountTarget,
    getRuleAnswers: () => effects,
    RuleEngineService: { getAttributeAnswers: async () => [] }, getCurrentUserId: () => 4,
    setEffects: (value) => loaded.push(value), setPlacements: (value) => restored.push(...value), setScore: (value) => scores.push(value),
    QuestionAnswerService: {
      getAnswersByUserAndQuestion: async () => [{ questionAttributeId: 11, attributeId: 8, conditionId: 2,
        tableName: "Balance Sheet", headerName: "Liabilities Side", arithmetic: "ADD", amount: 200, pairAttributeId: 19 }],
      getOverallMarks: async () => 96.5,
    },
  };
  await new Function(...Object.keys(context), `return (${loadHandler})();`)(...Object.values(context));
  assert.equal(loaded[0][11].length, 2);
  assert.deepEqual(scores, [96.5]);
  assert.equal(restored[0].id, 11); assert.equal(restored[0].attributeId, 8); assert.equal(restored[0].pairId, 19);
  assert.equal(restored[0].key, "11:2"); assert.equal(restored[0].amount, 200);
  assert.equal(restored[0].target, "Balance Sheet-Liabilities Side-add");
});

const resetStart = source.indexOf("const reset = async ") + "const reset = ".length;
const resetHandler = source.slice(resetStart, source.indexOf("\n  const remove =", resetStart)).trim().replace(/;$/, "");
function resetFixture(fails = false) {
  const updates = {}, busy = [], feedback = [];
  const context = {
    lock: { current: false }, generation: { current: 1 }, questionId: 9,
    rows: [{ id: 11, amount: 200 }], getCurrentUserId: () => 4,
    setBusy: (value) => busy.push(value), setFeedback: (value) => feedback.push(value),
    QuestionAnswerService: { resetAnswersByUserAndQuestion: async (userId, questionId) => {
      assert.equal(userId, 4); assert.equal(questionId, 9); assert.deepEqual(updates, {});
      if (fails) throw new Error("Reset failed");
    } },
    ...Object.fromEntries(["Placements", "Selected", "CheckMistakes", "WrongAttempts", "UsedHints", "ActionErrors", "Amounts"]
      .map((name) => [`set${name}`, (value) => { updates[name] = value; }])),
  };
  return { run: () => new Function(...Object.keys(context), `return (${resetHandler})();`)(...Object.values(context)), updates, busy, feedback, context };
}
test("Reset clears saved placements, Hint and wrong-answer state only after the server succeeds", async () => {
  const f = resetFixture(); await f.run();
  assert.deepEqual(f.updates, { Placements: [], Selected: null, CheckMistakes: false,
    WrongAttempts: {}, UsedHints: {}, ActionErrors: {}, Amounts: { 11: 200 } });
  assert.deepEqual(f.busy, [true, false]); assert.equal(f.context.lock.current, false);
});
test("a failed Reset preserves the student's state and releases the shared controls", async () => {
  const f = resetFixture(true); await f.run();
  assert.deepEqual(f.updates, {}); assert.deepEqual(f.busy, [true, false]);
  assert.deepEqual(f.feedback, ["Reset failed"]); assert.equal(f.context.lock.current, false);
});
