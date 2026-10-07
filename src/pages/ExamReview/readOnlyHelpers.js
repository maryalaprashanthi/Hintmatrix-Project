// Every question type submits the same normalised answer row shape
// (see buildSubmission.js): { answeredData: { tableName, headerName,
// attributeId, arithmetic, amount } }. These helpers turn that flat list back
// into the groupings each read-only answer view needs to redraw.

// The drag-and-drop question type always targets this same fixed set of
// destination tables (see ExamComponents/SampleData.js) - it isn't part of
// the question payload, so the review screen has to know it too.
import { data, normalizeFinalAccountTarget } from "../../components/Question/SampleData";

export const FINAL_ACCOUNT_TABLES = data;

// { [tableName]: { [headerName]: [{ attributeId, arithmetic, amount }] } }
export const groupByTableAndHeader = (answers) => {
  const grouped = {};

  (answers || []).forEach((answer) => {
    const data = answer?.answeredData;
    if (!data?.tableName || !data?.headerName) return;

    const target = normalizeFinalAccountTarget(`${data.tableName}-${data.headerName}`);
    const splitAt = target.lastIndexOf("-");
    const tableName = target.slice(0, splitAt);
    const headerName = target.slice(splitAt + 1);
    grouped[tableName] ??= {};
    grouped[tableName][headerName] ??= [];
    grouped[tableName][headerName].push({
      questionAttributeId: data.questionAttributeId,
      attributeId: data.attributeId,
      arithmetic: String(data.arithmetic ?? "").toLowerCase() === "subtract"
        ? "less" : String(data.arithmetic ?? "").toLowerCase(),
      amount: Number(data.amount || 0),
      status: data.status,
    });
  });

  return grouped;
};

export const questionAttributeLookup = (questionAttributes = []) => new Map(
  questionAttributes.filter((attribute) => attribute.questionAttributeId != null)
    .map((attribute) => [String(attribute.questionAttributeId), attribute]),
);

// Attribute id -> attribute name/amount, from the question's own trial
// balance / ledger attributes - used to put a label on a submitted row that
// otherwise only carries an attributeId.
export const attributeLookup = (questionAttributes = []) => {
  const map = new Map();
  questionAttributes.forEach((attribute) => {
    map.set(String(attribute.attributeId), attribute);
  });
  return map;
};

export const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-IN");
