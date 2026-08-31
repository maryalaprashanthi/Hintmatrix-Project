import { create } from "zustand";

// Shared cache, keyed by questionId, for everything the exam Dropdown/Journal
// pages load and the answers the user has entered. Navigating between exam
// questions unmounts/remounts these page components, so without this cache
// their local state (and any in-flight fetch) would be thrown away on every
// visit. Entries only disappear when the user explicitly hits Reset.
const useExamSessionStore = create((set, get) => ({
  byQuestionId: {},

  getEntry: (questionId) => get().byQuestionId[questionId],

  setQuestionType: (questionId, questionType) =>
    set((state) => ({
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...state.byQuestionId[questionId],
          questionType,
        },
      },
    })),

  setQuestionData: (questionId, data) =>
    set((state) => ({
      byQuestionId: {
        ...state.byQuestionId,
        [questionId]: {
          ...state.byQuestionId[questionId],
          ...data,
          answeredData: state.byQuestionId[questionId]?.answeredData ?? {},
        },
      },
    })),

  setAnsweredData: (questionId, updater) =>
    set((state) => {
      const current = state.byQuestionId[questionId]?.answeredData ?? {};
      const next = typeof updater === "function" ? updater(current) : updater;

      return {
        byQuestionId: {
          ...state.byQuestionId,
          [questionId]: {
            ...state.byQuestionId[questionId],
            answeredData: next,
          },
        },
      };
    }),

  resetQuestion: (questionId) =>
    set((state) => {
      const next = { ...state.byQuestionId };
      delete next[questionId];
      return { byQuestionId: next };
    }),
}));

export default useExamSessionStore;
