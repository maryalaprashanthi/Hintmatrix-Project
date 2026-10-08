import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./DropdownQuestion.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("  const handleSelection = async");
const end = source.indexOf("\n  return (", start);
const handlerSource = source.slice(start, end);

const setup = (correct) => {
  const item = { questionAttributeId: 12, attributeId: 7, ruleConditions: [] };
  const state = { open: 12, help: { item }, events: [] };
  const context = {
    userId: 8, questionId: 6, answeredData: {},
    isDropdownAttributeSolved: () => false,
    closeHelp: () => { state.help = null; },
    findMatchingCondition: () => correct ? { condition: { tableId: 3, headerId: 5, arithmetic: "add" } } : null,
    getPracticePosition: () => 1,
    getUnansweredDropdownConditions: () => [],
    setSelections: () => {},
    setOpenAttributeId: (id) => { state.open = id; },
    setHelpRequest: (help) => {
      assert.equal(state.open, null, "selector must close before feedback opens");
      state.help = help;
    },
    setShowHint: () => {}, handleAdd: () => {}, loadTotalScore: null,
    console: { log: () => {}, error: () => {} },
    QuestionAnswerService: {
      processAnswerEvent: async (event) => { state.events.push(event); return {}; },
      saveAnswer: async () => ({}),
    },
  };
  const handler = new Function(...Object.keys(context), `${handlerSource}\nreturn handleSelection;`)(...Object.values(context));
  return { item, state, handler };
};

test("wrong answer closes the selector before showing feedback", async () => {
  const { item, state, handler } = setup(false);
  await handler(item, "Debit", { value: 3, label: "Wrong account" });
  assert.equal(state.open, null);
  assert.equal(state.help.item, item);
  assert.equal(state.events[0].isCorrect, false);
});

test("correct answer clears previous incorrect-answer feedback", async () => {
  const { item, state, handler } = setup(true);
  await handler(item, "Debit", { value: 3, label: "Correct account" });
  assert.equal(state.help, null);
  assert.equal(state.open, 12);
  assert.equal(state.events[0].isCorrect, true);
});

test("both select menus close on selection and cannot overlap feedback", () => {
  assert.equal((source.match(/closeMenuOnSelect\s*\n/g) || []).length, 2);
  assert.match(source, /openAttributeId === item.questionAttributeId &&\s*!isSolved &&\s*!helpRequest/);
  assert.doesNotMatch(source, /hasBothSelections/);
});
