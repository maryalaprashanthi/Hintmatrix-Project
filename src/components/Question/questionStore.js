import { create } from "zustand";
import QuestionAnswerService from "../../services/QuestionAnswerService";

const useQuestionStore = create((set) => ({
  questions: [],
  question: {},
  droppableData: {},
  score: 0,
  setCurrentScore: async (id) => {
    const score = await QuestionAnswerService.getOverallMarks(id);
    set({ score });
  },
  setQuestions: async (apiQuestions) => {
    const formattedQuestions = [];
    let currentQuestion = {};
    apiQuestions.forEach((q) => {
      if (q.questionId != null) {
        currentQuestion = {
          questionId: q.questionId,
          courseId: q.courseId,
          chapterId: q.chapterId,
          questionText: q.questionText,
          questionCategory: q.questionCategory,
          courseName: q.courseName,
          chapterName: q.chapterName,
          categoryId: q.categoryId,
          categoryName: q.categoryName,
        };
      }
      if (q.questionAttributes) {
        q.questionAttributes.forEach((attribute) => {
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
    const currentScore = await QuestionAnswerService.getOverallMarks(1);
    set({
      questions: formattedQuestions,
      question: currentQuestion,
      score: currentScore,
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

  resetFrontend: (obj) => {
    set({ questions: [], droppableData: {} });
  },

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

  moveQuestion: (sourceId, targetId, condId, pairId) =>
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

      // if an object exists in droppableData[myId] with id as sourceId then return
      const alreadyPlaced = (state.droppableData[myId] ?? []).some(
        (obj) => obj.id === sourceId,
      );
      if (alreadyPlaced) {
        return state;
      }

      const ops = targetId.split("-").pop();
      let updatedData = null;
      // write this logic
      let found = [...state.droppableData[myId]].filter(
        (obj) => obj.id === pairId,
      );
      if (found.length > 0) {
        console.log("This is data in droppable ", [
          ...state.droppableData[myId],
        ]);
        updatedData = [...state.droppableData[myId]].filter((obj) => {
          return obj.id != pairId;
        });
        console.log("This is data in updated ", updatedData);
        // console.log("This is previous data ", updatedData);
        // what is wrong with this code
        found = found[0];
        // console.log("This is actual ", found);
        found = {
          id: found.id,
          name: found.name,
          amount: found.amount,
          operation: found.operation,
          pairId: found.pairId,
          isPaired: true,
        };
        // console.log("This is what is found in store ", found);
        updatedData.push(found);
        let newObj = {
          id: question.id,
          name: question.name,
          amount: question.amount,
          operation: ops,
          pairId,
          isPaired: true,
        };
        if (newObj.operation == "add") {
          updatedData.splice(-1, 0, newObj);
        } else {
          updatedData.push(newObj);
        }

        // how do I do this in js when I have a isPaired is true and operation is add
      } else {
        updatedData = [
          ...state.droppableData[myId],
          {
            id: question.id,
            name: question.name,
            amount: question.amount,
            operation: ops,
            pairId,
            isPaired: false,
          },
        ];
      }

      // console.log("I got here too with updated data ", updatedData);
      return {
        questions: nextQuestions,
        droppableData: { ...state.droppableData, [myId]: updatedData },
      };
      // console.log("I finally got here");
    }),
}));

export default useQuestionStore;
