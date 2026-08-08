import { create } from "zustand";

const useQuestionStore = create((set) => ({
  questions: [],
  question: null,
  setQuestions: (apiQuestions) => {
    const formattedQuestions = [];

    apiQuestions.forEach((question) => {
      if (question.questionAttributes) {
        question.questionAttributes.forEach((attribute) => {
          formattedQuestions.push({
            id: attribute.questionAttributeId,
            name: attribute.attributeName,
            amount: Number(attribute.amount),
            type:
              attribute.headerName === "Debit Particulars" ? "debit" : "credit",
            status: "pending",
          });
        });
      }
    });

    set({
      questions: formattedQuestions,
      question: apiQuestions.length > 0 ? apiQuestions[0] : null,

      // Reset all answer arrays when a new question is loaded
      tradingDataDebit: [],
      tradingDataCredit: [],
      profitDataDebit: [],
      profitDataCredit: [],
      balanceDataLiabilities: [],
      balanceDataAssets: [],
    });
  },
  tradingDataDebit: [],
  tradingDataCredit: [],
  profitDataDebit: [],
  profitDataCredit: [],
  balanceDataLiabilities: [],
  balanceDataAssets: [],
  // totalDebit: 0,
  // totalCredit: 0,
  // totalQ: 0,
  // solvedQ: 0,
  // setTotalDebit: (amt) => set({ totalDebit: amt }),
  // setTotalCredit: (amt) => set({ totalCredit: amt }),
  // setTotalQ: (amt) => set({ totalQ: amt }),
  // setSolvedQ: (amt) => set({ solvedQ: amt }),
  setError: (id) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (item.id === id) {
          return { ...item, status: "wrong" };
        } else {
          return item;
        }
      });
      return {
        questions: nextQuestions,
      };
    }),
  moveQuestion: (sourceId, targetId) =>
    set((state) => {
      const question = state.questions.find((item) => item.id == sourceId);

      if (!question) {
        return state;
      }

      const nextQuestions = state.questions.map((item) => {
        if (item.id === sourceId) {
          return { ...item, status: "solved" };
        } else {
          return item;
        }
      });

      if (targetId === "trading-dr-add") {
        return {
          questions: nextQuestions,
          tradingDataDebit: [
            ...state.tradingDataDebit,
            { ...question, operation: "+" },
          ],
        };
      } else if (targetId === "trading-dr-sub") {
        return {
          questions: nextQuestions,
          tradingDataDebit: [
            ...state.tradingDataDebit,
            { ...question, operation: "-" },
          ],
        };
      } else if (targetId === "trading-cr-add") {
        return {
          questions: nextQuestions,
          tradingDataCredit: [
            ...state.tradingDataCredit,
            { ...question, operation: "+" },
          ],
        };
      } else if (targetId === "trading-cr-sub") {
        return {
          questions: nextQuestions,
          tradingDataCredit: [
            ...state.tradingDataCredit,
            { ...question, operation: "-" },
          ],
        };
      } else if (targetId === "pnl-dr-add") {
        return {
          questions: nextQuestions,
          profitDataDebit: [
            ...state.profitDataDebit,
            { ...question, operation: "+" },
          ],
        };
      } else if (targetId === "pnl-dr-sub") {
        return {
          questions: nextQuestions,
          profitDataDebit: [
            ...state.profitDataDebit,
            { ...question, operation: "-" },
          ],
        };
      } else if (targetId === "pnl-cr-add") {
        return {
          questions: nextQuestions,
          profitDataCredit: [
            ...state.profitDataCredit,
            { ...question, operation: "+" },
          ],
        };
      } else if (targetId === "pnl-cr-sub") {
        return {
          questions: nextQuestions,
          profitDataCredit: [
            ...state.profitDataCredit,
            { ...question, operation: "-" },
          ],
        };
      } else if (targetId === "balance-liabilities-add") {
        return {
          questions: nextQuestions,
          balanceDataLiabilities: [
            ...state.balanceDataLiabilities,
            { ...question, operation: "+" },
          ],
        };
      } else if (targetId === "balance-liabilities-sub") {
        return {
          questions: nextQuestions,
          balanceDataLiabilities: [
            ...state.balanceDataLiabilities,
            { ...question, operation: "-" },
          ],
        };
      } else if (targetId === "balance-assets-add") {
        return {
          questions: nextQuestions,
          balanceDataAssets: [
            ...state.balanceDataAssets,
            { ...question, operation: "+" },
          ],
        };
      } else if (targetId === "balance-assets-sub") {
        return {
          questions: nextQuestions,
          balanceDataAssets: [
            ...state.balanceDataAssets,
            { ...question, operation: "-" },
          ],
        };
      }
    }),
}));

export default useQuestionStore;
