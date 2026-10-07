import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { create } from "zustand";
import { calculateFinalAccounts, normalizeFinalAccountTarget } from "../src/components/Question/SampleData.js";

const loadModule = (source) => import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${Math.random()}`);
const storeSource = await readFile(new URL("../src/components/Question/questionStore.js", import.meta.url), "utf8");
const pageSource = (await readFile(new URL("../src/components/Question/QuestionPage.jsx", import.meta.url), "utf8")).replace(/\r\n/g, "\n");

async function setup(attributes = []) {
  globalThis.finalPracticeCreate = create;
  globalThis.finalPracticeService = { getOverallMarks: async () => 42 };
  globalThis.finalPracticeUser = () => 17;
  const module = await loadModule(storeSource
    .replace('import { create } from "zustand";', 'const create = globalThis.finalPracticeCreate;')
    .replace('import QuestionAnswerService from "../../services/QuestionAnswerService";', 'const QuestionAnswerService = globalThis.finalPracticeService;')
    .replace('import { getCurrentUserId } from "../../utils/user";', 'const getCurrentUserId = globalThis.finalPracticeUser;'));
  const store = module.default;
  await store.getState().setQuestions([{ questionId: 8, chapterId: 1, questionAttributes: attributes }]);
  store.getState().setTableData([
    "Trading Account-Debit Particulars", "Trading Account-Credit Particulars",
    "Profit & Loss Account-Debit Particulars", "Profit & Loss Account-Credit Particulars",
    "Balance Sheet-Liabilities Side", "Balance Sheet-Asset Side",
  ]);
  return { store, ...module };
}

const condition = (tableName, headerName, arithmetic, amountPosition = "1", tableId = 1, headerId = 1) =>
  ({ tableName, headerName, arithmetic, amountPosition, tableId, headerId });

test("repeated trial-balance accounts retain separate row identities and both amounts", async () => {
  const { store } = await setup([
    { questionAttributeId: 501, attributeId: 7, attributeName: "Sales", amount: 100, amount2: 25, headerName: "Credit Particulars" },
    { questionAttributeId: 502, attributeId: 7, attributeName: "Sales", amount: 200, headerName: "Credit Particulars" },
  ]);
  assert.deepEqual(store.getState().questions.map(({ id, attributeId, amount2 }) => ({ id, attributeId, amount2 })), [
    { id: 501, attributeId: 7, amount2: 25 }, { id: 502, attributeId: 7, amount2: null },
  ]);
  for (const id of [501, 502]) store.getState().moveQuestion(id, "Trading Account-Credit Particulars-add", 1);
  assert.equal(store.getState().droppableData["Trading Account-Credit Particulars"].length, 2);
  const result = calculateFinalAccounts(store.getState().droppableData);
  assert.equal(result.grossResult, 300);
  assert.equal(result.netResult, 300);
  assert.equal(store.getState().questions.every((row) => row.status === "solved"), true);
  assert.equal(Object.values(store.getState().droppableData).flat().some((row) => row.isDerived), false);
});

test("rules use the current chapter and amount selector for each adjustment effect", async () => {
  const { getRuleAnswers, getAnswerAmount } = await setup();
  const rules = [
    { chapterId: 2, condition1: condition("Trading Account", "Credit Particulars", "add") },
    { chapterId: 1, pairAttributeId: 3,
      condition1: condition("Trading Account", "Credit Particulars", "add", "1"),
      condition2: condition("Balance Sheet", "Asset Side", "add", "amount2", 3, 6) },
  ];
  const answers = getRuleAnswers(rules, 1, { amount: 100, amount2: 80 });
  assert.deepEqual(answers.map((answer) => answer.amount), [100, 80]);
  assert.equal(answers[1].pairAttributeId, 3);
  assert.throws(() => getAnswerAmount({ amount: 100 }, "2"), /missing or invalid/);
  assert.throws(() => getAnswerAmount({ amount: 100 }, "0"), /missing or invalid/);
  assert.throws(() => getRuleAnswers(rules, 9, { amount: 100 }), /No active rule/);
  assert.throws(() => getRuleAnswers([rules[1], rules[1]], 1, { amount: 100, amount2: 80 }), /More than one/);
});

test("each condition can be placed once, even when two effects share a destination", async () => {
  const { store } = await setup([{ questionAttributeId: 501, attributeId: 7, attributeName: "Adjustment", amount: 100, amount2: 25 }]);
  store.getState().setTotalAnswers(501, 2);
  store.getState().moveQuestion(501, "Balance Sheet-Asset Side-add", 1, null, 100);
  store.getState().moveQuestion(501, "Balance Sheet-Asset Side-add", 2, null, 25);
  store.getState().moveQuestion(501, "Balance Sheet-Asset Side-add", 2, null, 25);
  assert.deepEqual(store.getState().droppableData["Balance Sheet-Asset Side"].map((row) => row.amount), [100, 25]);
  assert.equal(store.getState().questions[0].status, "solved");
  store.getState().resetFrontend();
  assert.deepEqual(store.getState().droppableData["Balance Sheet-Asset Side"], []);
  assert.equal(calculateFinalAccounts(store.getState().droppableData).netResult, 0);
});

test("deductions pair by account identity while retaining independent question-row identities", async () => {
  const { store } = await setup([
    { questionAttributeId: 501, attributeId: 2, attributeName: "Purchases", amount: 500 },
    { questionAttributeId: 502, attributeId: 9, attributeName: "Returns", amount: 75 },
  ]);
  store.getState().moveQuestion(502, "Trading Account-Debit Particulars-less", 1, 2);
  store.getState().moveQuestion(501, "Trading Account-Debit Particulars-add", 1);
  const rows = store.getState().droppableData["Trading Account-Debit Particulars"];
  assert.deepEqual(rows.map((row) => row.id), [501, 502]);
  assert.equal(rows.every((row) => row.isPaired), true);
  assert.equal(calculateFinalAccounts(store.getState().droppableData).grossResult, -425);
});

test("deducting from a repeated account keeps every grouped addition in the inner amount column", async () => {
  const { store } = await setup([
    { questionAttributeId: 501, attributeId: 2, attributeName: "Purchases", amount: 500 },
    { questionAttributeId: 502, attributeId: 2, attributeName: "Purchases", amount: 200 },
    { questionAttributeId: 503, attributeId: 9, attributeName: "Returns", amount: 75 },
  ]);
  store.getState().moveQuestion(501, "Trading Account-Debit Particulars-add", 1);
  store.getState().moveQuestion(502, "Trading Account-Debit Particulars-add", 1);
  store.getState().moveQuestion(503, "Trading Account-Debit Particulars-less", 1, 2);
  const rows = store.getState().droppableData["Trading Account-Debit Particulars"];
  assert.equal(rows.every((row) => row.isPaired), true);
  assert.equal(calculateFinalAccounts(store.getState().droppableData).grossResult, -625);
});

const restoreSource = pageSource.slice(pageSource.indexOf("  const loadAnsweredQuestions = async"),
  pageSource.indexOf("  // TIMER", pageSource.indexOf("  const loadAnsweredQuestions = async")));
const { default: makeRestore } = await loadModule(`export default (dependencies) => {
  const { QuestionAnswerService, getCurrentUserId, questionId, useQuestionStore,
    setPlacementError, setTotalAnswers, moveQuestion, normalizeFinalAccountTarget } = dependencies;
  const console = { log() {}, warn() {}, error() {} };
  ${restoreSource}
  return loadAnsweredQuestions;
};`);

test("restoring saved amounts uses question-row identity and keeps old ambiguous answers out of the proforma", async () => {
  const { store } = await setup([
    { questionAttributeId: 501, attributeId: 7, attributeName: "Sales", amount: 100, amount2: 25 },
    { questionAttributeId: 502, attributeId: 7, attributeName: "Sales", amount: 200 },
  ]);
  const errors = [];
  await makeRestore({
    QuestionAnswerService: { getAnswersByUserAndQuestion: async () => [
      { questionAttributeId: 501, attributeId: 7, tableName: "Profit and Loss Account", headerName: "Credit Particulars", arithmetic: "add", amount: 25, conditionId: 2, totalAnswers: 2 },
      { attributeId: 7, tableName: "Trading Account", headerName: "Credit Particulars", arithmetic: "add", amount: 100, conditionId: 1, totalAnswers: 1 },
    ] },
    getCurrentUserId: () => 17, questionId: 8, useQuestionStore: store,
    setPlacementError: (error) => errors.push(error),
    setTotalAnswers: store.getState().setTotalAnswers, moveQuestion: store.getState().moveQuestion,
    normalizeFinalAccountTarget,
  })();
  assert.equal(errors.length, 1);
  assert.deepEqual(store.getState().droppableData["Profit & Loss Account-Credit Particulars"].map((row) => [row.id, row.amount]), [[501, 25]]);
  assert.equal(store.getState().questions[0].status, "pending");
  assert.equal(store.getState().questions[1].answered.length, 0);
});

const dragStart = pageSource.indexOf("async (Event) => {", pageSource.indexOf("<DragDropProvider"));
const dragEnd = pageSource.indexOf("\n      }}\n    >", dragStart) + "\n      }".length;
const { default: makeDragHandler } = await loadModule(`export default (dependencies) => {
  const { questions, RuleEngineService, QuestionAnswerService, useQuestionStore,
    getRuleAnswers, normalizeFinalAccountTarget, getCurrentUserId, questionId,
    moveQuestion, setActualAnswers, setTotalAnswers, setHints, setPlacementError,
    setError, setAttributeId, setCurrentScore } = dependencies;
  const questionMap = { debit: "debit particulars", credit: "credit particulars" };
  const answerMap = { add: "ADD", less: "SUBTRACT" };
  const console = { log() {}, warn() {}, error() {} };
  return ${pageSource.slice(dragStart, dragEnd)};
};`);

test("the actual drag handler fetches by account ID and saves the selected amount with row identity", async () => {
  const { store, getRuleAnswers } = await setup([
    { questionAttributeId: 501, attributeId: 7, attributeName: "Adjustment", amount: 100, amount2: 80 },
  ]);
  const calls = [];
  const handler = makeDragHandler({
    ...store.getState(), questions: store.getState().questions,
    getRuleAnswers, normalizeFinalAccountTarget, useQuestionStore: store,
    getCurrentUserId: () => 17, questionId: 8,
    RuleEngineService: { getAttributeAnswers: async (id) => {
      calls.push(["rule", id]);
      return [{ chapterId: 1, condition1: condition("Balance Sheet", "Asset Side", "add", "2", 3, 6) }];
    } },
    QuestionAnswerService: {
      processAnswerEvent: async (body) => calls.push(["event", body]),
      saveAnswer: async (body) => calls.push(["save", body]),
    },
    setPlacementError: (message) => { if (message) assert.fail(message); },
  });
  await handler({ operation: { source: { id: 501 }, target: { id: "Balance Sheet-Asset Side-add" } } });
  assert.deepEqual(calls[0], ["rule", 7]);
  const event = calls.find(([type]) => type === "event")[1];
  const saved = calls.find(([type]) => type === "save")[1];
  assert.equal(event.finalAccounts, true);
  assert.equal(event.questionAttributeId, 501);
  assert.equal(event.attributeId, 7);
  assert.equal(event.amount, 80);
  assert.equal(saved.questionAttributeId, 501);
  assert.equal(saved.amount, 80);
  assert.equal(store.getState().droppableData["Balance Sheet-Asset Side"][0].amount, 80);
});

const draggableSource = (await readFile(new URL("../src/components/Question/Draggable.jsx", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
const autoFillSource = draggableSource.slice(draggableSource.indexOf("  const handleAutoFill = async"),
  draggableSource.indexOf("\n  return (", draggableSource.indexOf("  const handleAutoFill = async")));
const { default: makeAutoFill } = await loadModule(`export default (dependencies) => {
  const { id, questionId, useQuestionStore, setIsAutoFilling,
    setAutoFillError, RuleEngineService, QuestionAnswerService, getRuleAnswers,
    normalizeFinalAccountTarget, setActualAnswers, setTotalAnswers, setHints,
    getCurrentUserId, moveQuestion, setCurrentScore } = dependencies;
  const console = { log() {}, warn() {}, error() {} };
  ${autoFillSource}
  return handleAutoFill;
};`);

test("atomic autofill restores only unanswered effects and never sends separate placement saves", async () => {
  const { store, getRuleAnswers } = await setup([
    { questionAttributeId: 501, attributeId: 7, attributeName: "Adjustment", amount: 100, amount2: 80 },
  ]);
  store.getState().setTotalAnswers(501, 2);
  store.getState().moveQuestion(501, "Trading Account-Credit Particulars-add", 1, null, 100);
  const rules = [{ chapterId: 1,
    condition1: condition("Trading Account", "Credit Particulars", "add", "1"),
    condition2: condition("Balance Sheet", "Asset Side", "add", "2", 3, 6),
  }];
  const events = [];
  const errors = [];
  const busy = [];
  const run = (processAnswerEvent) => makeAutoFill({
    ...store.getState(), id: 501, questionId: 8,
    useQuestionStore: store,
    getRuleAnswers, normalizeFinalAccountTarget, getCurrentUserId: () => 17,
    setIsAutoFilling: (value) => busy.push(value), setAutoFillError: (error) => errors.push(error),
    RuleEngineService: { getAttributeAnswers: async () => rules },
    QuestionAnswerService: { processAnswerEvent,
      saveAnswer: () => assert.fail("Atomic autofill must not save a separate placement") },
  })();
  await run(async () => { throw new Error("Atomic save unavailable"); });
  assert.deepEqual(store.getState().droppableData["Balance Sheet-Asset Side"], []);
  assert.equal(store.getState().questions[0].status, "pending");
  assert.equal(errors.at(-1), "Atomic save unavailable");
  assert.equal(store.getState().busyOperation, null);
  await run(async (body) => events.push(body));
  assert.equal(events.length, 1);
  assert.equal(events[0].conditionId, 2);
  assert.equal(events[0].questionAttributeId, 501);
  assert.equal(events[0].attributeId, 7);
  assert.equal(events[0].amount, 80);
  assert.equal(store.getState().droppableData["Trading Account-Credit Particulars"].length, 1);
  assert.equal(store.getState().droppableData["Balance Sheet-Asset Side"][0].amount, 80);
  assert.equal(store.getState().questions[0].status, "solved");
  assert.deepEqual(busy, [true, false, true, false]);
});
