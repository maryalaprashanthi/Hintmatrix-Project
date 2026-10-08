import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Exercise the actual handler with service/store doubles, without rendering React.
const source = readFileSync(new URL("./Draggable.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("const handleAutoFill = ") + "const handleAutoFill = ".length;
const handler = source.slice(start, source.indexOf("\n\n  return (", start)).trim().replace(/;$/, "");

function setup(failSave = false) {
  const saved = [], events = [], moved = [], errors = [];
  const row = { id: 42, questionAttributeId: 42, attributeId: 8, status: "pending", answered: [] };
  const state = { questions: [row], question: { chapterId: 3 } };
  const operation = {};
  state.beginOperation = () => operation;
  state.isOperationCurrent = (value) => value === operation;
  state.endOperation = () => {};
  const answers = [
    { conditionId: 1, tableNameId: 10, headerId: 6, answer: "Trading Account-debit particulars-add", amount: 100 },
    { conditionId: 2, tableNameId: 11, headerId: 5, answer: "Balance Sheet-credit particulars-less", amount: 25 },
  ];
  const context = {
    useQuestionStore: { getState: () => state }, questionId: 24, id: 42,
    setIsAutoFilling: () => {}, setAutoFillError: (value) => errors.push(value),
    RuleEngineService: { getAttributeAnswers: async () => [] }, getRuleAnswers: () => answers,
    normalizeFinalAccountTarget: (value) => value,
    setActualAnswers: () => {}, setTotalAnswers: () => {}, setHints: () => {},
    QuestionAnswerService: {
      processAnswerEvent: async (event) => events.push(event),
      saveAnswer: async (answer) => {
        if (failSave) throw new Error("Save failed");
        saved.push(answer);
      },
    },
    getCurrentUserId: () => 17,
    moveQuestion: (...args) => moved.push(args), setCurrentScore: async () => {},
  };
  const run = new Function(...Object.keys(context), `return (${handler})();`);
  return { run: () => run(...Object.values(context)), saved, events, moved, errors, row };
}

test("auto-fill persists every condition with user, row identity and selected amounts", async () => {
  const fixture = setup();
  await fixture.run();
  assert.equal(fixture.saved.length, 2);
  assert.equal(fixture.events.length, 2);
  assert.equal(fixture.moved.length, 2);
  assert.deepEqual(fixture.saved.map((answer) => answer.amount), [100, 25]);
  for (const answer of fixture.saved) {
    assert.equal(answer.userId, 17);
    assert.equal(answer.questionId, 24);
    assert.equal(answer.questionAttributeId, 42);
    assert.equal(answer.attributeId, 8);
    assert.equal(answer.totalAnswers, 2);
  }
  assert.ok(fixture.events.every((event) => event.eventType === "AUTOFILL"));
});

test("auto-fill saves only remaining conditions", async () => {
  const fixture = setup();
  fixture.row.answered = [{ conditionId: 1 }];
  await fixture.run();
  assert.equal(fixture.saved.length, 1);
  assert.equal(fixture.saved[0].conditionId, 2);
  assert.equal(fixture.saved[0].totalAnswers, 2);
});

test("failed persistence is reported without showing an unsaved placement", async () => {
  const fixture = setup(true);
  await fixture.run();
  assert.equal(fixture.moved.length, 0);
  assert.equal(fixture.saved.length, 0);
  assert.ok(fixture.errors.includes("Save failed"));
});
