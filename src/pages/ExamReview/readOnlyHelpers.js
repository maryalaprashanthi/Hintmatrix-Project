// Every question type submits the same normalised answer row shape
// (see buildSubmission.js): { answeredData: { tableName, headerName,
// attributeId, arithmetic, amount } }. These helpers turn that flat list back
// into the groupings each read-only answer view needs to redraw.

// The drag-and-drop question type always targets this same fixed set of
// destination tables (see ExamComponents/SampleData.js) - it isn't part of
// the question payload, so the review screen has to know it too.
export const FINAL_ACCOUNT_TABLES = [
  {
    name: "Balance Sheet",
    headers: ["liabilities side", "Asset Side"],
  },
  {
    name: "Profit & Loss Account",
    headers: ["Debit Particulars", "Credit Particulars"],
  },
  {
    name: "Trading Account",
    headers: ["Debit Particulars", "Credit Particulars"],
  },
];

// { [tableName]: { [headerName]: [{ attributeId, arithmetic, amount }] } }
export const groupByTableAndHeader = (answers) => {
  const grouped = {};

  (answers || []).forEach((answer) => {
    const data = answer?.answeredData;
    if (!data?.tableName || !data?.headerName) return;

    grouped[data.tableName] ??= {};
    grouped[data.tableName][data.headerName] ??= [];
    grouped[data.tableName][data.headerName].push({
      attributeId: data.attributeId,
      arithmetic: data.arithmetic,
      amount: Number(data.amount || 0),
      status: data.status,
    });
  });

  return grouped;
};

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
