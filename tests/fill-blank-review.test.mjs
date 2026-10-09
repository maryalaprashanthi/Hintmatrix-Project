import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { restoreBlankAnswers } from "../src/utils/questionAttemptState.js";

const source = readFileSync(new URL("../src/components/Question/FillInBlankQuestionView.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const helpers = source.slice(source.indexOf("const blankPattern ="), source.indexOf("const FillInBlankQuestionView ="));
const normalize = new Function(`${helpers}; return getBackendBlanks;`)();
const reviewStart = source.indexOf("  const isAnswerCorrect =");
const reviewFunction = source.slice(reviewStart, source.indexOf("\n\n  let blankIndex", reviewStart));
const review = (blanks, answers, saved) => new Function("savedAnswers", "answers", "getAcceptedAnswers", `${reviewFunction}; return isAnswerCorrect;`)(
  { current: saved }, answers, (index) => blanks[index]?.acceptedAnswers ?? [],
);
const question12 = {
  questionId: 12,
  questionText: "Opening stock is recorded on the _____ side of the _____ Account.",
  answers: [
    { answerId: 1, answerText: "Debit", blankNumber: 1, displayOrder: 1, isCorrect: true },
    { answerId: 2, answerText: "Credit", blankNumber: 1, displayOrder: 2, isCorrect: false },
    { answerId: 3, answerText: "Trading", blankNumber: 2, displayOrder: 3, isCorrect: true },
    { answerId: 4, answerText: "Profit and Loss", blankNumber: 2, displayOrder: 4, isCorrect: false },
  ],
};

test("question 12 groups choices by blank number, excluding distractors from accepted answers", () => {
  const blanks = normalize(question12);
  assert.equal(blanks.length, 2);
  assert.deepEqual(blanks.map((blank) => blank.acceptedAnswers), [["Debit"], ["Trading"]]);
  assert.deepEqual(blanks.flatMap((blank) => blank.answerOptions), ["Debit", "Credit", "Trading", "Profit and Loss"]);
  const check = review(blanks, ["Debit", "Trading"], {});
  assert.equal(check(0), true);
  assert.equal(check(1), true);
  const wrong = review(blanks, ["Credit", "Profit and Loss"], {});
  assert.equal(wrong(0), false);
  assert.equal(wrong(1), false);
});

test("option display order cannot move an answer to a different blank", () => {
  const scrambled = { ...question12, answers: question12.answers.map((answer, index) => ({ ...answer, displayOrder: 4 - index })).reverse() };
  assert.deepEqual(normalize(scrambled).map((blank) => blank.acceptedAnswers), [["Debit"], ["Trading"]]);
});

test("all accepted alternatives for each blank remain valid", () => {
  const blanks = normalize({ ...question12, answers: [...question12.answers,
    { answerId: 5, answerText: "Trading Account", blankNumber: 2, displayOrder: 5, isCorrect: true },
  ] });
  assert.deepEqual(blanks[1].acceptedAnswers, ["Trading", "Trading Account"]);
  assert.equal(review(blanks, ["Debit", "trading account"], {})(1), true);
});

test("restored score and review use the same server result even if the answer key later changes", () => {
  const restored = restoreBlankAnswers([1, 2].map((position) => ({
    answerEventId: position, eventType: "ANSWER", arithmetic: "FILL_IN_THE_BLANK",
    answerPosition: position, userAnswer: position === 1 ? "Debit" : "Trading", isCorrect: true,
  })), 2);
  assert.equal(restored.score, 2);
  const check = review([{ acceptedAnswers: ["Changed"] }, { acceptedAnswers: ["Changed"] }], restored.answers, restored.saved);
  assert.equal(check(0), true);
  assert.equal(check(1), true);
  assert.equal(review(normalize(question12), ["Debit", "Trading"], { 1: { userAnswer: "Trading", isCorrect: false } })(1), false);
});

test("single blank choices and legacy answers without blank numbers still work", () => {
  const single = normalize({ questionText: "Opening stock is on the _____ side.", answers: question12.answers.slice(0, 2).map(({ blankNumber, ...answer }) => answer) });
  assert.deepEqual(single[0].acceptedAnswers, ["Debit"]);
  assert.deepEqual(single[0].answerOptions, ["Debit", "Credit"]);
  const legacy = normalize({ questionText: question12.questionText, answers: [
    { answerText: "Debit", displayOrder: 1 }, { answerText: "Trading", displayOrder: 2 },
  ] });
  assert.deepEqual(legacy.map((blank) => blank.acceptedAnswers), [["Debit"], ["Trading"]]);
});

test("a missing blank option group cannot shift later answers into its position", () => {
  const blanks = normalize({ ...question12, answers: question12.answers.filter((answer) => answer.blankNumber === 2) });
  assert.deepEqual(blanks.map((blank) => blank.acceptedAnswers), [[], ["Trading"]]);
});