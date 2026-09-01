import { create } from "zustand";

// Independent store for the exam drag-and-drop question type. Unlike
// questionStore.js, this never tracks correctness (no actualAnswers, no
// "wrong" status, no score) and only supports a single placement per item,
// since it has no rule-engine data to know an item belongs in multiple spots.
const useExamQuestionStore = create((set, get) => ({
  questions: [],
  droppableData: {},

  // Tracks which question is currently loaded so the page can skip
  // re-fetching (and wiping the user's placements) when the exam simply
  // navigates back to a question already visited this session.
  loadedQuestionId: null,

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

    set({ questions: formattedQuestions, loadedQuestionId: questionId });
  },

  setTableData: (data) => {
    const allTablesData = Object.fromEntries(data.map((d) => [d, []]));
    set({ droppableData: allTablesData });
  },

  resetFrontend: () => {
    set({ questions: [], droppableData: {}, loadedQuestionId: null });
  },

  moveQuestion: (sourceId, targetId) =>
    set((state) => {
      const question = state.questions.find((item) => item.id == sourceId);

      if (!question || question.status === "placed") {
        return state;
      }

      const tableKey = targetId.split("-").slice(0, 2).join("-");
      const operation = targetId.split("-").pop();

      const existingTableData = get().droppableData[tableKey] ?? [];

      const updatedTableData = [
        ...existingTableData,
        {
          id: question.id,
          name: question.name,
          amount: question.amount,
          operation,
        },
      ];

      const nextQuestions = state.questions.map((item) =>
        item.id === sourceId
          ? { ...item, status: "placed", targetId }
          : item,
      );

      return {
        questions: nextQuestions,
        droppableData: { ...state.droppableData, [tableKey]: updatedTableData },
      };
    }),

  removeAnswer: (sourceId) =>
    set((state) => {
      const question = state.questions.find((item) => item.id == sourceId);

      if (!question || question.status !== "placed") {
        return state;
      }

      const tableKey = question.targetId.split("-").slice(0, 2).join("-");
      const existingTableData = get().droppableData[tableKey] ?? [];

      const updatedTableData = existingTableData.filter(
        (obj) => obj.id !== sourceId,
      );

      const nextQuestions = state.questions.map((item) =>
        item.id === sourceId
          ? { ...item, status: "pending", targetId: null }
          : item,
      );

      return {
        questions: nextQuestions,
        droppableData: { ...state.droppableData, [tableKey]: updatedTableData },
      };
    }),
}));

export default useExamQuestionStore;
