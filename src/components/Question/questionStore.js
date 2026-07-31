import { create } from "zustand";

const initialQuestions = [
  {
    id: 1,
    name: "Wages",
    amount: 1000,
    type: "debit",
    status: "pending",
  },
  {
    id: 2,
    name: "Capital",
    amount: 500,
    type: "credit",
    status: "pending",
  },
  {
    id: 3,
    name: "Purchases",
    amount: 10,
    type: "debit",
    status: "pending",
  },
  {
    id: 4,
    name: "Purchase Returns",
    amount: 701,
    type: "credit",
    status: "pending",
  },
  {
    id: 5,
    name: "Stock",
    amount: 15000,
    type: "debit",
    status: "pending",
  },
  {
    id: 6,
    name: "Opening Stock",
    amount: 512,
    type: "credit",
    status: "pending",
  },
  {
    id: 7,
    name: "Loans",
    amount: 10,
    type: "debit",
    status: "pending",
  },
  {
    id: 8,
    name: "Investor capital",
    amount: 701,
    type: "credit",
    status: "pending",
  },
  {
    id: 9,
    name: "Loss",
    amount: 15000,
    type: "debit",
    status: "pending",
  },
  {
    id: 10,
    name: "EBITDA",
    amount: 512,
    type: "credit",
    status: "pending",
  },
];

const useQuestionStore = create((set) => ({
  questions: initialQuestions,
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
