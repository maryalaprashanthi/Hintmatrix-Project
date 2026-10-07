import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { create } from "zustand";

const loadModule = (source) => import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${Math.random()}`
);

// Exercise the real header click handler without requiring a browser renderer.
const header = await readFile(new URL("../src/components/Question/Header.jsx", import.meta.url), "utf8");
const handler = header.slice(header.indexOf("  const handleReset = async"), header.indexOf("\n  return ("));
const { default: createResetHandler } = await loadModule(`
  export default (dependencies) => {
    const { isResetting, setIsResetting, question, getCurrentUserId,
      QuestionAnswerService, setAnsweredData, resetLocalAnswers,
      resetFrontend, setCheckMistakes, alert, propQuestion } = dependencies;
    const useQuestionStore = dependencies.useQuestionStore ?? { getState: () => ({
      beginOperation: () => ({}), isOperationCurrent: () => true, endOperation: () => {},
    }) };
    const console = { log() {}, error() {} };
    ${handler}
    return handleReset;
  }
`);

test("header reset clears drag/drop, journal, and dropdown only after the answer PUT succeeds", async () => {
  for (const type of ["drag/drop", "journal", "dropdown"]) {
    const calls = [];
    const reset = createResetHandler({
      isResetting: false,
      setIsResetting: (busy) => calls.push(["busy", busy]),
      question: { questionId: 8 },
      getCurrentUserId: () => 17,
      QuestionAnswerService: { resetAnswersByUserAndQuestion: async (...ids) => calls.push(["reset", ...ids]) },
      setAnsweredData: type === "drag/drop" ? undefined : (answers) => calls.push(["answers", answers]),
      resetFrontend: () => calls.push(["placements"]),
      setCheckMistakes: (open) => calls.push(["mistakes", open]),
      alert: (message) => assert.fail(message),
    });
    await reset();
    assert.deepEqual(calls, [
      ["busy", true], ["reset", 17, 8],
      type === "drag/drop" ? ["placements"] : ["answers", {}],
      ["mistakes", false], ["busy", false],
    ]);
  }
});

test("failed reset leaves current answers intact and unlocks the button", async () => {
  const busy = [];
  let reported = false;
  const reset = createResetHandler({
    isResetting: false,
    setIsResetting: (value) => busy.push(value),
    question: { questionId: 8 },
    getCurrentUserId: () => 17,
    QuestionAnswerService: { resetAnswersByUserAndQuestion: async () => { throw new Error("Unavailable"); } },
    setAnsweredData: () => assert.fail("Answers cleared before successful reset"),
    alert: () => { reported = true; },
  });
  await reset();
  assert.deepEqual(busy, [true, false]);
  assert.equal(reported, true);
});

test("drag/drop reset clears placements while preserving the question and rule metadata", async () => {
  globalThis.resetTestCreate = create;
  globalThis.resetTestService = { getOverallMarks: async () => 42 };
  globalThis.resetTestUserId = () => 17;
  const source = (await readFile(new URL("../src/components/Question/questionStore.js", import.meta.url), "utf8"))
    .replace('import { create } from "zustand";', 'const create = globalThis.resetTestCreate;')
    .replace('import QuestionAnswerService from "../../services/QuestionAnswerService";', 'const QuestionAnswerService = globalThis.resetTestService;')
    .replace('import { getCurrentUserId } from "../../utils/user";', 'const getCurrentUserId = globalThis.resetTestUserId;');
  const { default: store } = await loadModule(source);
  const rules = [{ conditionId: 3, target: "Trading Account-Debit Particulars-ADD" }];
  const question = { questionId: 8, questionText: "Trial balance" };
  store.setState({
    question,
    score: 42,
    questions: [{ id: 5, amount: 100, status: "solved", answered: [{ conditionId: 3 }],
      wrongAttempts: 2, usedHint: true, attemptingId: 4, actualAnswers: rules, totalAnswers: 2, hints: ["Hint"] }],
    droppableData: { "Trading Account-Debit Particulars": [{ id: 5, amount: 100 }] },
  });

  store.getState().resetFrontend();
  const state = store.getState();
  assert.equal(state.question, question);
  assert.equal(state.score, 42);
  assert.equal(state.questions.length, 1);
  assert.equal(state.questions[0].status, "pending");
  assert.deepEqual(state.questions[0].answered, []);
  assert.equal(state.questions[0].wrongAttempts, 0);
  assert.equal(state.questions[0].usedHint, false);
  assert.equal(state.questions[0].attemptingId, 3);
  assert.equal(state.questions[0].actualAnswers, rules);
  assert.equal(state.questions[0].totalAnswers, 2);
  assert.deepEqual(state.droppableData, { "Trading Account-Debit Particulars": [] });
  store.getState().resetFrontend();
  assert.equal(store.getState().questions.length, 1);
});

test("question reset sends only the current-answer PUT for the selected user and question", async () => {
  const calls = [];
  globalThis.resetTestApi = { put: async (url) => {
    calls.push(url);
    return { data: "Answers reset successfully" };
  } };
  const source = (await readFile(new URL("../src/services/QuestionAnswerService.js", import.meta.url), "utf8"))
    .replace('import apiClient from "./apiClient";', 'const apiClient = globalThis.resetTestApi;')
    .replace('import PracticeResultService from "./PracticeResultService";', 'const PracticeResultService = {};');
  const { default: service } = await loadModule(source);
  assert.equal(await service.resetAnswersByUserAndQuestion(17, 8), "Answers reset successfully");
  assert.deepEqual(calls, ["/api/question_answers/user/17/question/8/reset"]);
  assert.equal(service.resetAnswerEventsByUserAndQuestion, undefined);
});
