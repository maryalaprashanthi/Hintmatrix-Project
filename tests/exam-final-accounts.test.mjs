import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { data, normalizeFinalAccountTarget } from "../src/components/Question/SampleData.js";

const loadSource = (source) => import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${Math.random()}`
);
const question = {
  questionId: 8,
  questionType: "Drag And Drop",
  questionAttributes: [
    { questionAttributeId: 101, attributeId: 5, attributeName: "Sales", headerName: "Credit Particulars", amount: 100 },
    { questionAttributeId: 102, attributeId: 5, attributeName: "Sales", headerName: "Credit Particulars", amount: 200, amount2: 40 },
  ],
};
const debit = "Trading Account-Debit Particulars";
const credit = "Trading Account-Credit Particulars";
const assets = "Balance Sheet-Asset Side";
const targets = data.flatMap((table) => table.headers.map((header) => `${table.name}-${header}`));

for (const mode of ["Exam", "MockExam"]) {
  const { default: store } = await import(`../src/components/${mode}/ExamComponents/examQuestionStore.js`);
  const builderSource = await readFile(new URL(`../src/components/${mode}/ExamComponents/buildSubmission.js`, import.meta.url), "utf8");
  const typeSource = await readFile(new URL(`../src/components/${mode}/ExamComponents/questionTypeOf.js`, import.meta.url), "utf8");
  const inlineType = typeSource.replace("export default questionTypeOf;", "")
    .replace('console.log("this is input ksjdf", input);', "");
  const { buildSubmission } = await loadSource(builderSource.replace('import { questionTypeOf } from "./questionTypeOf";', inlineType));
  const start = () => {
    store.getState().reset();
    store.getState().setQuestions(8, [question]);
    store.getState().setTableData(targets);
  };

  test(`${mode}: repeated accounts and adjustment effects keep their own question-row identities`, () => {
    start();
    store.getState().moveQuestion(101, `${credit}-add`);
    store.getState().moveQuestion("102", `${credit}-add`);
    store.getState().moveQuestion(102, `${assets}-add`);
    store.getState().moveQuestion(102, `${assets}-add`);
    const slice = store.getState().byQuestionId[8];
    assert.deepEqual(slice.droppableData[credit].map((row) => [row.questionAttributeId, row.attributeId, row.amount]), [[101, 5, 100], [102, 5, 200]]);
    assert.equal(slice.droppableData[assets].length, 1);
    store.getState().removeAnswer("102", `${assets}-add`);
    assert.equal(store.getState().byQuestionId[8].questions[1].status, "placed");
    assert.equal(store.getState().byQuestionId[8].droppableData[credit].length, 2);
    store.getState().removeAnswer(102, `${credit}-add`);
    assert.equal(store.getState().byQuestionId[8].questions[1].status, "pending");
    assert.equal(store.getState().byQuestionId[8].questions[0].status, "placed");
  });

  test(`${mode}: selected and adjusted amounts are submitted; generated carry rows are excluded`, () => {
    start();
    store.getState().setAmountSelection(102, "amount2");
    store.getState().moveQuestion(102, `${debit}-less`);
    assert.equal(store.getState().byQuestionId[8].droppableData[debit][0].amount, 40);
    store.getState().updatePlacementAmount(102, `${debit}-less`, "30.25");
    store.getState().updatePlacementAmount(102, `${debit}-less`, "-5");
    const slice = store.getState().byQuestionId[8];
    const payload = buildSubmission({
      questions: [{ id: 8, question }], sessionById: {}, userId: 17,
      examDragById: { 8: { ...slice, droppableData: { ...slice.droppableData,
        [credit]: [{ id: "generated", derived: true, operation: "add", amount: 30.25 }] } } },
    });
    assert.equal(payload.answers[0].answers.length, 1);
    assert.deepEqual(payload.answers[0].answers[0].answeredData, {
      tableName: "Trading Account", headerName: "Debit Particulars",
      questionAttributeId: 102, attributeId: 5, arithmetic: "less", amount: 30.25,
      info: "attempted to SUBTRACT on Debit Particulars of Trading Account.",
    });
  });

  test(`${mode}: invalid drop targets and another question's reset cannot change this answer`, () => {
    start();
    store.getState().moveQuestion(101, `${credit}-add`);
    store.getState().moveQuestion(102, "Missing Account-Debit Particulars-add");
    const original = store.getState().byQuestionId[8];
    store.getState().setQuestions(9, [{ ...question, questionId: 9 }]);
    store.getState().setTableData(targets);
    store.getState().resetQuestion(9);
    assert.equal(store.getState().byQuestionId[8], original);
    assert.equal(store.getState().byQuestionId[8].droppableData[credit].length, 1);
  });

  test(`${mode}: additional adjustments stay outside trial-balance debit and credit totals`, () => {
    store.getState().reset();
    store.getState().setQuestions(8, [{ ...question, questionAttributes: [
      ...question.questionAttributes,
      { questionAttributeId: 103, attributeId: 8, attributeName: "Closing Stock", headerName: "Adjustments", amount: 20 },
    ] }]);
    const rows = store.getState().byQuestionId[8].questions;
    assert.equal(rows[2].type, "adjustment");
    assert.equal(rows.filter((row) => row.type === "credit").reduce((sum, row) => sum + row.amount, 0), 300);
  });

  test(`${mode}: journal submission remains unchanged`, () => {
    const journalQuestion = { questionType: "Journal", questionAttributes: [
      { questionAttributeId: 201, attributeId: 11, tables: [{ id: 1, name: "Cash A/c" }] },
    ] };
    const payload = buildSubmission({ questions: [{ id: 9, question: journalQuestion }], userId: 17,
      sessionById: { 9: { question: journalQuestion, answeredData: { 201: [
        { questionAttributeId: 201, tableNameId: 1, particulars: "Cash A/c..........Dr", debit: 20, credit: "" },
      ] } } }, examDragById: {} });
    assert.deepEqual(payload.answers[0].answers[0].answeredData, {
      tableName: "Cash A/c", headerName: "Debit Particulars", attributeId: 11,
      arithmetic: "add", amount: 20, info: "attempted to ADD on Debit Particulars of Cash A/c.",
    });
  });
}

globalThis.finalAccountsTestData = data;
globalThis.finalAccountsTestNormalizeTarget = normalizeFinalAccountTarget;
const reviewSource = (await readFile(new URL("../src/pages/ExamReview/readOnlyHelpers.js", import.meta.url), "utf8"))
  .replace('import { data, normalizeFinalAccountTarget } from "../../components/Question/SampleData";',
    "const data = globalThis.finalAccountsTestData; const normalizeFinalAccountTarget = globalThis.finalAccountsTestNormalizeTarget;");
const { groupByTableAndHeader, questionAttributeLookup } = await loadSource(reviewSource);

test("review retains question-row identity and submitted amount across old proforma names", () => {
  const grouped = groupByTableAndHeader([
    { answeredData: { tableName: "Balance Sheet", headerName: "liabilities side", questionAttributeId: 102, attributeId: 5, amount: 30.25, arithmetic: "less" } },
    { answeredData: { tableName: "Profit and Loss Account", headerName: "Credit Particulars", questionAttributeId: 101, attributeId: 5, amount: 100, arithmetic: "add" } },
  ]);
  assert.equal(grouped["Balance Sheet"]["Liabilities Side"][0].amount, 30.25);
  assert.equal(grouped["Balance Sheet"]["Liabilities Side"][0].questionAttributeId, 102);
  assert.equal(grouped["Profit & Loss Account"]["Credit Particulars"][0].questionAttributeId, 101);
  const lookup = questionAttributeLookup(question.questionAttributes);
  assert.equal(lookup.get("101").amount, 100);
  assert.equal(lookup.get("102").amount, 200);
});
