import { create } from "zustand";

// Independent store for the exam drag-and-drop question type. Unlike
// questionStore.js, this never tracks correctness (no actualAnswers, no
// "wrong" status, no score) and only supports a single placement per item,
// since it has no rule-engine data to know an item belongs in multiple spots.
//
// Keyed by questionId: a paper can hold more than one drag-and-drop question
// and each keeps its own trial-balance items and its own placed rows. Only one
// such question is mounted at a time (ExamPage shows a single question), so
// `activeQuestionId` says which slice the shared table / dropzone components
// read and which slice moveQuestion / removeAnswer mutate.
const emptySlice = () => ({ questions: [], droppableData: {} });

const useExamQuestionStore = create((set, get) => ({
  // { [questionId]: { questions: [...], droppableData: {...} } }
  byQuestionId: {},

  // The drag question currently on screen. Set on every visit - including a
  // cached revisit that skips the fetch - so the table always reads its own
  // slice rather than whichever question was loaded last.
  activeQuestionId: null,

  setActiveQuestion: (questionId) => set({ activeQuestionId: questionId }),

  setQuestions: (questionId, apiQuestions) => {
    const formattedQuestions = [];

    apiQuestions.forEach((q) => {
      (q.questionAttributes || []).forEach((attribute) => {
        formattedQuestions.push({
          id: attribute.attributeId,
          name: attribute.attributeName,
          amount: Number(attribute.amount),
          type:
            attribute.headerName === "Debit Particulars" ? "debit" : "credit",
          status: "pending",
          targetId: null,
        });
      });
    });

    set((state) => ({
      activeQuestionId: questionId,
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...(state.byQuestionId[questionId] ?? emptySlice()),
          questions: formattedQuestions,
        },
      },
    }));
  },

  setTableData: (data) => {
    const questionId = get().activeQuestionId;
    if (questionId == null) return;

    const allTablesData = Object.fromEntries(data.map((d) => [d, []]));

    set((state) => ({
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...(state.byQuestionId[questionId] ?? emptySlice()),
          droppableData: allTablesData,
        },
      },
    }));
  },

  // Drops one drag question's slice. The page refetches it (its cached type in
  // examSessionStore is cleared at the same time) on the next visit.
  resetQuestion: (questionId) =>
    set((state) => {
      const next = { ...state.byQuestionId };
      delete next[questionId];
      return { byQuestionId: next };
    }),

  // Wipe every drag question's slice - used once the paper is submitted.
  reset: () => set({ byQuestionId: {}, activeQuestionId: null }),

  moveQuestion: (sourceId, targetId) =>
    set((state) => {
      const questionId = state.activeQuestionId;
      const slice = state.byQuestionId[questionId];

      if (!slice) {
        return state;
      }

      const question = slice.questions.find((item) => item.id == sourceId);

      if (!question || question.status === "placed") {
        return state;
      }

      const tableKey = targetId.split("-").slice(0, 2).join("-");
      const operation = targetId.split("-").pop();

      const existingTableData = slice.droppableData[tableKey] ?? [];

      const updatedTableData = [
        ...existingTableData,
        {
          id: question.id,
          name: question.name,
          amount: question.amount,
          operation,
        },
      ];

      const nextQuestions = slice.questions.map((item) =>
        item.id === sourceId
          ? { ...item, status: "placed", targetId }
          : item,
      );

      return {
        byQuestionId: {
          ...state.byQuestionId,
          [questionId]: {
            questions: nextQuestions,
            droppableData: {
              ...slice.droppableData,
              [tableKey]: updatedTableData,
            },
          },
        },
      };
    }),

  removeAnswer: (sourceId) =>
    set((state) => {
      const questionId = state.activeQuestionId;
      const slice = state.byQuestionId[questionId];

      if (!slice) {
        return state;
      }

      const question = slice.questions.find((item) => item.id == sourceId);

      if (!question || question.status !== "placed") {
        return state;
      }

      const tableKey = question.targetId.split("-").slice(0, 2).join("-");
      const existingTableData = slice.droppableData[tableKey] ?? [];

      const updatedTableData = existingTableData.filter(
        (obj) => obj.id !== sourceId,
      );

      const nextQuestions = slice.questions.map((item) =>
        item.id === sourceId
          ? { ...item, status: "pending", targetId: null }
          : item,
      );

      return {
        byQuestionId: {
          ...state.byQuestionId,
          [questionId]: {
            questions: nextQuestions,
            droppableData: {
              ...slice.droppableData,
              [tableKey]: updatedTableData,
            },
          },
        },
      };
    }),
}));

export default useExamQuestionStore;
