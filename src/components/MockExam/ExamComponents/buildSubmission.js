// Turns the answer state the exam pages keep into the payload the submit API
// expects:
//
//   POST /api/mock-exams/{examId}/submit
//   {
//     userId,
//     answers: [
//       {
//         questionId,
//         questionType,           // "JOURNAL" | "DROPDOWN" | "DRAG_AND_DROP"
//         answers: [
//           { answeredData: { tableName, headerName, attributeId, arithmetic, amount } }
//         ]
//       }
//     ]
//   }
//
// JOURNAL and DROPDOWN answers live in examSessionStore (keyed by questionId,
// then by questionAttributeId). DRAG_AND_DROP placements live in the separate
// examQuestionStore, also keyed by questionId.

import { questionTypeOf } from "./questionTypeOf";

const HEADER_BY_SIDE = {
  Debit: "Debit Particulars",
  Credit: "Credit Particulars",
};

// A journal/dropdown line stores its money in whichever of debit/credit applies.
const lineAmount = (row) => Number(row.debit || row.credit || 0);

const isNarration = (row) => String(row?.particulars || "").startsWith("(Being");

// Fallback when we can't resolve the ledger account by id: recover it from the
// text the row shows ("Cash Ac..........Dr" / "To Cash Ac" / "Cash Ac ... Dr").
const accountNameFromText = (particulars = "") =>
  particulars
    .replace(/^To\s+/i, "")
    .replace(/\.+\s*Dr\s*$/i, "")
    .replace(/\s*\.\.\.\s*Dr\s*$/i, "")
    .replace(/\.+$/, "")
    .trim();

const attributeIdFor = (attribute, questionAttributeId) =>
  attribute?.attributeId ?? Number(questionAttributeId) ?? questionAttributeId;

// Mirrors the practice flow's own answerMap (QuestionPage.jsx) for just the
// arithmetic keys an answer line ever carries. Journal/Dropdown always add.
const OPERATION_LABEL = { add: "ADD", less: "SUBTRACT" };

const describeInfo = (arithmetic, headerName, tableName) =>
  `attempted to ${OPERATION_LABEL[arithmetic] ?? arithmetic} on ${headerName} of ${tableName}.`;

// --- JOURNAL -----------------------------------------------------------------
const journalAnswers = (entry) => {
  const attributes = entry?.question?.questionAttributes || [];
  const answeredData = entry?.answeredData || {};

  return Object.entries(answeredData).flatMap(([questionAttributeId, rows]) => {
    const attribute = attributes.find(
      (item) =>
        String(item.questionAttributeId) === String(questionAttributeId),
    );

    return (rows || [])
      .filter((row) => !isNarration(row) && row.questionAttributeId != null)
      .map((row) => {
        const side = row.debit !== "" && row.debit != null ? "Debit" : "Credit";
        const table = (attribute?.tables || []).find(
          (item) => String(item.id) === String(row.tableNameId),
        );

        const tableName = table?.name ?? accountNameFromText(row.particulars);
        const headerName = HEADER_BY_SIDE[side];
        const arithmetic = "add";

        return {
          answeredData: {
            tableName,
            headerName,
            attributeId: attributeIdFor(attribute, questionAttributeId),
            arithmetic,
            amount: lineAmount(row),
            info: describeInfo(arithmetic, headerName, tableName),
          },
        };
      });
  });
};

// --- DROPDOWN --------------------------------------------------------------
const dropdownAnswers = (entry) => {
  const attributes = entry?.question?.questionAttributes || [];
  const questionTables = entry?.questionTables || [];
  const answeredData = entry?.answeredData || {};

  return Object.entries(answeredData).flatMap(([questionAttributeId, rows]) => {
    const attribute = attributes.find(
      (item) =>
        String(item.questionAttributeId) === String(questionAttributeId),
    );

    return (rows || [])
      .filter((row) => row.side && !isNarration(row))
      .map((row) => {
        const table = questionTables.find(
          (item) => String(item.id) === String(row.optionValue),
        );

        const tableName = table?.name ?? accountNameFromText(row.particulars);
        const headerName = HEADER_BY_SIDE[row.side];
        const arithmetic = "add";

        return {
          answeredData: {
            tableName,
            headerName,
            attributeId: attributeIdFor(attribute, questionAttributeId),
            arithmetic,
            amount: lineAmount(row),
            info: describeInfo(arithmetic, headerName, tableName),
          },
        };
      });
  });
};

// --- MCQ ---------------------------------------------------------------
// Selection lives in examSessionStore's answeredData under a single
// "selected" key (an array so the exam page's generic "has this question
// been answered" check keeps working unchanged) - one id for single-choice,
// any number for multiple-choice.
const mcqAnswers = (entry, multiple) => {
  const selected = entry?.answeredData?.selected || [];

  if (!selected.length) {
    return [];
  }

  return [
    {
      answeredData: multiple
        ? { selectedAnswerIds: selected }
        : { selectedAnswerId: selected[0] },
    },
  ];
};

// --- DRAG_AND_DROP -------------------------------------------------------
// droppableData is keyed "<tableName>-<headerName>"; each placed row already
// carries the attribute id, the amount and the add/less operation.
const dragAnswers = (dragSlice) => {
  return Object.entries(dragSlice?.droppableData || {}).flatMap(([key, rows]) => {
    const splitAt = key.lastIndexOf("-");
    const tableName = splitAt === -1 ? key : key.slice(0, splitAt);
    const headerName = splitAt === -1 ? "" : key.slice(splitAt + 1);

    return (rows || []).map((row) => ({
      answeredData: {
        tableName,
        headerName,
        attributeId: row.id,
        arithmetic: row.operation,
        amount: Number(row.amount || 0),
        info: describeInfo(row.operation, headerName, tableName),
      },
    }));
  });
};

export const buildSubmission = ({
  questions,
  sessionById,
  examDragById,
  userId,
  timeTakenSeconds,
}) => {
  // Every question in the paper is sent, whether attempted or not. An
  // unattempted question goes out with an empty `answers` array so the
  // backend can still score it (as a miss) instead of skipping it.
  const answers = questions.map(({ id, question }) => {
    const entry = sessionById[id];
    // The question_type table stores "Journal" / "DropDown" / "Drag And Drop",
    // so branch on the normalised token - a raw "Journal" would miss both the
    // JOURNAL and DROPDOWN cases and submit an empty answer array.
    const questionType =
      questionTypeOf(question) ??
      questionTypeOf(entry?.questionType) ??
      questionTypeOf(entry?.question);

    let answered = [];
    if (questionType === "JOURNAL") {
      answered = journalAnswers(entry);
    } else if (questionType === "DROPDOWN") {
      answered = dropdownAnswers(entry);
    } else if (questionType === "MULTIPLE_CHOICE") {
      answered = mcqAnswers(entry, true);
    } else if (questionType === "SINGLE_CHOICE") {
      answered = mcqAnswers(entry, false);
    } else {
      answered = dragAnswers(examDragById?.[id]);
    }

    return { questionId: id, questionType, answers: answered };
  });

  return { userId, answers, timeTakenSeconds };
};

export default buildSubmission;
