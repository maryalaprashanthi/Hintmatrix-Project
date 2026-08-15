import { create } from "zustand";

const useQuestionStore = create((set) => ({
  questions: [],
  droppableData: {},
  setQuestions: (apiQuestions) => {
    const formattedQuestions = [];

    apiQuestions.forEach((question) => {
      if (question.questionAttributes) {
        question.questionAttributes.forEach((attribute) => {
          formattedQuestions.push({
            id: attribute.attributeId,
            name: attribute.attributeName,
            amount: Number(attribute.amount),
            hints: [],
            usedHint: false,
            attemptingId: 1,
            type:
              attribute.headerName === "Debit Particulars" ? "debit" : "credit",
            status: "pending",
            answered: [],
            actualAnswers: [],
            totalAnswers: 1,
          });
        });
      }
    });

    set({
      questions: formattedQuestions,
    });
  },

  setActualAnswers: (id, actualAnswers) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (item.id === id) {
          return { ...item, actualAnswers: actualAnswers };
        } else {
          return item;
        }
      });
      return {
        questions: nextQuestions,
      };
    }),

  setHintUsed: (id) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (item.id === id) {
          return { ...item, usedHint: true };
        } else {
          return item;
        }
      });
      return {
        questions: nextQuestions,
      };
    }),

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

  setHints: (id, hints) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (item.id === id) {
          return { ...item, hints: hints };
        } else {
          return item;
        }
      });
      return { questions: nextQuestions };
    }),

  setTotalAnswers: (id, count) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (item.id === id) {
          return { ...item, totalAnswers: count };
        } else {
          return item;
        }
      });
      return { questions: nextQuestions };
    }),

  setAttributeId: (id, attributeId) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (item.id === id) {
          return { ...item, attemptingId: attributeId };
        } else {
          return item;
        }
      });
      return { questions: nextQuestions };
    }),

  setTableData: (data) => {
    const allTablesData = Object.fromEntries(data.map((d) => [d, []]));

    console.log("This is full table data", allTablesData);

    set({ droppableData: allTablesData });
  },

  moveQuestion: (sourceId, targetId, condId) =>
    set((state) => {
      const question = state.questions.find((item) => item.id == sourceId);

      if (!question) {
        return state;
      }
      console.log("I got here");

      // const nextQuestions = [...item.answered, targetId];

      const nextQuestions = state.questions.map((item) => {
        if (item.id !== sourceId) {
          return item;
        }

        const updatedAnswered = [
          ...item.answered,
          { conditionId: condId, answer: targetId },
        ];
        // console.log("Updated answered is ", updatedAnswered);

        return {
          ...item,
          answered: updatedAnswered,
          status:
            item.totalAnswers === updatedAnswered.length ? "solved" : "pending",
        };
      });

      const myId = targetId.split("-").slice(0, 2).join("-");
      const ops = targetId.split("-").pop();
      const updatedData = [
        ...state.droppableData[myId],
        {
          name: question.name,
          amount: question.amount,
          operation: ops,
        },
      ];

      // console.log("I got here too with updated data ", updatedData);
      return {
        questions: nextQuestions,
        droppableData: { ...state.droppableData, [myId]: updatedData },
      };
      // console.log("I finally got here");
    }),
}));

export default useQuestionStore;
