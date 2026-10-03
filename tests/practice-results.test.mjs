import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { getPracticePosition } from "../src/utils/practicePosition.js";

const source = (await readFile(new URL("../src/services/QuestionAnswerService.js", import.meta.url), "utf8"))
  .replace('import apiClient from "./apiClient";', 'const apiClient = globalThis.practiceTestApi;')
  .replace('import PracticeResultService from "./PracticeResultService";',
    'const PracticeResultService = globalThis.practiceTestResults;');

async function setup(event, failPractice = false) {
  const calls = [];
  globalThis.practiceTestApi = { post: async (url, body) => {
    calls.push({ url, body });
    return { data: event };
  } };
  globalThis.practiceTestResults = { recordFromEvent: async (body) => {
    calls.push({ url: "/api/practice/results/from-event", body });
    if (failPractice) throw new Error("Practice API unavailable");
  } };
  const { default: service } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${Math.random()}`);
  return { service, calls };
}

test("keeps answer event payload and response, then records wrong attribute", async () => {
  const event = { answerEventId: 10, eventType: "ANSWER", isCorrect: false };
  const { service, calls } = await setup(event);
  const payload = { questionId: 2, attributeId: 3, eventType: "ANSWER", isCorrect: false };
  assert.equal(await service.processAnswerEvent({ ...payload, questionAttributeId: 7 }), event);
  assert.deepEqual(calls[0], { url: "/api/answer_events", body: payload });
  assert.equal(calls[1].body.answerEventId, 10);
  assert.equal("questionAttributeId" in calls[1].body, false);
});

test("hint requests and autofill do not count as practice attempts", async () => {
  for (const event of [
    { answerEventId: 10, eventType: "HINT", isCorrect: null },
    { answerEventId: 11, eventType: "AUTOFILL", isCorrect: true },
  ]) {
    const { service, calls } = await setup(event);
    await service.processAnswerEvent(event);
    assert.equal(calls.length, 1);
  }
});

test("matching source identity goes only to the practice API", async () => {
  const event = { answerEventId: 12, eventType: "ANSWER", isCorrect: false };
  const { service, calls } = await setup(event);
  await service.processAnswerEvent({ answerPosition: 9, unitPosition: 7 });
  assert.deepEqual(calls[0].body, { answerPosition: 9 });
  assert.equal(calls[1].body.unitPosition, 7);
});

test("practice failure retries only practice and preserves answer success", async () => {
  const event = { answerEventId: 13, eventType: "ANSWER", isCorrect: true };
  const { service, calls } = await setup(event, true);
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.equal(await service.processAnswerEvent({ questionId: 2 }), event);
    assert.equal(calls.filter(c => c.url === "/api/answer_events").length, 1);
    assert.equal(calls.filter(c => c.url === "/api/practice/results/from-event").length, 2);
  } finally { console.error = originalError; }
});

test("Journal and Dropdown practice metadata survives null or omitted event positions", async () => {
  for (const payload of [{ attributeId: 3 }, { attributeId: 3, answerPosition: null }]) {
    const { service, calls } = await setup({ answerEventId: 20, eventType: "ANSWER", isCorrect: true, answerPosition: null });
    await service.processAnswerEvent({ ...payload, unitPosition: 2 });
    assert.deepEqual(calls[0].body, payload);
    assert.equal(calls[1].body.unitPosition, 2);
  }
});

test("wrong answers target an unanswered position without overwriting a solved side", () => {
  const pending = [
    { type: "Credit", condition: { position: 2 } },
    { type: "Debit", condition: { position: 3 } },
  ];
  assert.equal(getPracticePosition({ position: 4 }, pending, "Debit"), 4);
  assert.equal(getPracticePosition(null, pending, "Debit"), 3);
  assert.equal(getPracticePosition(null, pending.slice(0, 1), "Debit"), 2);
  assert.equal(getPracticePosition(null, [], "Debit"), null);
});
