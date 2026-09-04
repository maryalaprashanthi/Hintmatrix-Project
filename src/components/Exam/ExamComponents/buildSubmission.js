// Turns the answer state the exam pages keep into the payload the submit API
// expects:
//
//   POST /api/exams/{examId}/submit
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

        return {
          answeredData: {
            tableName: table?.name ?? accountNameFromText(row.particulars),
            headerName: HEADER_BY_SIDE[side],
            attributeId: attributeIdFor(attribute, questionAttributeId),
            arithmetic: "add",
            amount: lineAmount(row),
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

        return {
          answeredData: {
            tableName: table?.name ?? accountNameFromText(row.particulars),
            headerName: HEADER_BY_SIDE[row.side],
            attributeId: attributeIdFor(attribute, questionAttributeId),
            arithmetic: "add",
            amount: lineAmount(row),
          },
        };
      });
  });
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
      },
    }));
  });
};

export const buildSubmission = ({
  questions,
  sessionById,
  examDragById,
  userId,
}) => {
  const answers = questions
    .map(({ id, question }) => {
      const entry = sessionById[id];
      const questionType =
        question?.questionType ??
        entry?.questionType ??
        entry?.question?.questionType;

      let answered = [];
      if (questionType === "JOURNAL") {
        answered = journalAnswers(entry);
      } else if (questionType === "DROPDOWN") {
        answered = dropdownAnswers(entry);
      } else {
        answered = dragAnswers(examDragById?.[id]);
      }

      return { questionId: id, questionType, answers: answered };
    })
    .filter((question) => question.answers.length > 0);

  return { userId, answers };
};

export default buildSubmission;
