import { create } from "zustand";
import { getQuestionAttributeSide } from "../../../utils/questionAttributeSide";

// Each question owns its trial balance and placements. Question-row ids keep
// repeated accounts separate; one row may have effects in several accounts.
const emptySlice = () => ({ questions: [], droppableData: {} });
const sameId = (left, right) => String(left) === String(right);
const targetParts = (targetId) => {
  const splitAt = String(targetId).lastIndexOf("-");
  return [String(targetId).slice(0, splitAt), String(targetId).slice(splitAt + 1)];
};

const useExamQuestionStore = create((set, get) => ({
  byQuestionId: {},
  activeQuestionId: null,
  setActiveQuestion: (questionId) => set({ activeQuestionId: questionId }),

  setQuestions: (questionId, apiQuestions) => {
    const questions = apiQuestions.flatMap((q) =>
      (q.questionAttributes || []).map((attribute, index) => ({
        id: attribute.questionAttributeId ?? `${questionId}:${attribute.attributeId}:${index}`,
        questionAttributeId: attribute.questionAttributeId ?? null,
        attributeId: attribute.attributeId,
        name: attribute.attributeName,
        amount: Number(attribute.amount || 0),
        amount2: attribute.amount2 == null ? null : Number(attribute.amount2),
        amountSelection: "amount",
        type: getQuestionAttributeSide(attribute) ?? "adjustment",
        status: "pending",
      })),
    );
    set((state) => ({
      activeQuestionId: questionId,
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: { ...(state.byQuestionId[questionId] ?? emptySlice()), questions },
      },
    }));
  },

  setTableData: (data) => {
    const questionId = get().activeQuestionId;
    if (questionId == null) return;
    set((state) => ({
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...(state.byQuestionId[questionId] ?? emptySlice()),
          droppableData: Object.fromEntries(data.map((key) => [key, []])),
        },
      },
    }));
  },

  setAmountSelection: (sourceId, amountSelection) => set((state) => {
    const questionId = state.activeQuestionId;
    const slice = state.byQuestionId[questionId];
    if (!slice || !["amount", "amount2"].includes(amountSelection)) return state;
    return {
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...slice,
          questions: slice.questions.map((question) => sameId(question.id, sourceId)
            ? { ...question, amountSelection } : question),
        },
      },
    };
  }),

  resetQuestion: (questionId) => set((state) => {
    const next = { ...state.byQuestionId };
    delete next[questionId];
    return { byQuestionId: next };
  }),
  reset: () => set({ byQuestionId: {}, activeQuestionId: null }),

  moveQuestion: (sourceId, targetId) => set((state) => {
    const questionId = state.activeQuestionId;
    const slice = state.byQuestionId[questionId];
    const question = slice?.questions.find((item) => sameId(item.id, sourceId));
    if (!question) return state;
    const [tableKey, operation] = targetParts(targetId);
    const existingRows = slice.droppableData[tableKey];
    if (!existingRows || !["add", "less"].includes(operation)
      || existingRows.some((row) => sameId(row.id, sourceId) && row.operation === operation)) {
      return state;
    }
    const row = {
      id: question.id,
      questionAttributeId: question.questionAttributeId,
      attributeId: question.attributeId,
      name: question.name,
      amount: question.amountSelection === "amount2" && question.amount2 != null
        ? question.amount2 : question.amount,
      amountSelection: question.amountSelection,
      operation,
      targetId,
    };
    return {
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...slice,
          questions: slice.questions.map((item) => sameId(item.id, sourceId)
            ? { ...item, status: "placed" } : item),
          droppableData: { ...slice.droppableData, [tableKey]: [...existingRows, row] },
        },
      },
    };
  }),

  updatePlacementAmount: (sourceId, targetId, amount) => set((state) => {
    const questionId = state.activeQuestionId;
    const slice = state.byQuestionId[questionId];
    const [tableKey, operation] = targetParts(targetId);
    const value = Number(amount);
    if (!slice?.droppableData[tableKey] || !Number.isFinite(value) || value < 0) return state;
    return {
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...slice,
          droppableData: {
            ...slice.droppableData,
            [tableKey]: slice.droppableData[tableKey].map((row) =>
              sameId(row.id, sourceId) && row.operation === operation
                ? { ...row, amount: value } : row),
          },
        },
      },
    };
  }),

  removeAnswer: (sourceId, targetId) => set((state) => {
    const questionId = state.activeQuestionId;
    const slice = state.byQuestionId[questionId];
    if (!slice) return state;
    const [tableKey, operation] = targetParts(targetId);
    const rows = slice.droppableData[tableKey];
    if (!rows) return state;
    const droppableData = {
      ...slice.droppableData,
      [tableKey]: rows.filter((row) => !(sameId(row.id, sourceId) && row.operation === operation)),
    };
    const remainsPlaced = Object.values(droppableData).some((entries) =>
      entries.some((row) => sameId(row.id, sourceId)));
    return {
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...slice,
          droppableData,
          questions: slice.questions.map((item) => sameId(item.id, sourceId)
            ? { ...item, status: remainsPlaced ? "placed" : "pending" } : item),
        },
      },
    };
  }),
}));

export default useExamQuestionStore;
