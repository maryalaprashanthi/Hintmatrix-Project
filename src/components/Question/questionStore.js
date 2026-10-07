import { create } from "zustand";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import { getCurrentUserId } from "../../utils/user";
import { getQuestionAttributeSide } from "../../utils/questionAttributeSide";

// A rule selects an amount for each effect. Missing second amounts must not
// silently become zero, especially for two-sided final-account adjustments.
export const getAnswerAmount = (question, amountPosition = "1") => {
  const position = String(amountPosition ?? "1").trim().toLowerCase();
  const value = ["2", "amount2"].includes(position)
    ? question.amount2
    : ["1", "amount", "amount1"].includes(position)
      ? question.amount
      : undefined;
  if (value == null || value === "" || !Number.isFinite(Number(value))) {
    throw new Error("This account has a missing or invalid rule amount.");
  }
  return Number(value);
};

export const getRuleAnswers = (rules, chapterId, question) => {
  const activeRules = (Array.isArray(rules) ? rules : [])
    .filter((rule) => rule.activeRow !== false);
  const applicable = activeRules.filter((rule) =>
    chapterId == null || String(rule.chapterId) === String(chapterId));
  if (applicable.length !== 1) {
    throw new Error(applicable.length
      ? "More than one rule is configured for this account in the chapter."
      : "No active rule is configured for this account in the chapter.");
  }
  const rule = applicable[0];
  const answers = [];
  for (let conditionId = 1; conditionId <= 4; conditionId++) {
    const condition = rule[`condition${conditionId}`];
    if (!condition?.arithmetic) continue;
    const rawOperation = String(condition.arithmetic).trim().toLowerCase();
    const operation = rawOperation === "subtract" ? "less" : rawOperation;
    if (!["add", "less"].includes(operation) || !condition.tableName || !condition.headerName) {
      throw new Error("This account has an incomplete placement rule.");
    }
    answers.push({
      conditionId,
      answer: `${condition.tableName}-${condition.headerName}-${operation}`,
      tableNameId: condition.tableId,
      headerId: condition.headerId,
      pairAttributeId: rule.pairAttributeId,
      amountPosition: condition.amountPosition,
      amount: getAnswerAmount(question, condition.amountPosition),
      information: condition.information,
    });
  }
  if (!answers.length) throw new Error("No placement is configured for this account.");
  return answers;
};

const useQuestionStore = create((set, get) => ({
  questions: [],
  question: {},
  droppableData: {},
  score: 0,
  busyOperation: null,
  operationSequence: 0,
  beginOperation: (questionId, kind) => {
    const state = get();
    if (state.busyOperation || String(state.question.questionId) !== String(questionId)) return null;
    const operation = { questionId: String(questionId), kind, sequence: state.operationSequence + 1 };
    set({ busyOperation: operation, operationSequence: operation.sequence });
    return operation;
  },
  isOperationCurrent: (operation) => operation != null && get().busyOperation === operation &&
    String(get().question.questionId) === operation.questionId,
  endOperation: (operation) => {
    if (operation != null && get().busyOperation === operation) set({ busyOperation: null });
  },
  setCurrentScore: async (id) => {
    const score = await QuestionAnswerService.getOverallMarks(id);
    await set({ score });
  },
  setQuestions: async (apiQuestions) => {
    const formattedQuestions = [];
    let currentQuestion = {};
    apiQuestions.forEach((q) => {
      if (q.questionId != null) {
        currentQuestion = {
          questionId: q.questionId,
          courseId: q.courseId,
          subjectId: q.subjectId,
          chapterId: q.chapterId,
          questionText: q.questionText,
          questionTopic: q.questionTopic,
          courseName: q.courseName,
          subjectName: q.subjectName,
          chapterName: q.chapterName,
          topicId: q.topicId,
          topicName: q.topicName,
        };
      }
      if (q.questionAttributes) {
        q.questionAttributes.forEach((attribute, rowIndex) => {
          formattedQuestions.push({
            id: attribute.questionAttributeId ?? `question-${q.questionId}-row-${rowIndex}`,
            attributeId: attribute.attributeId,
            questionAttributeId: attribute.questionAttributeId,
            name: attribute.attributeName,
            amount: Number(attribute.amount),
            amount2: attribute.amount2 == null || attribute.amount2 === ""
              ? null : Number(attribute.amount2),
            hints: [],
            usedHint: false,
            attemptingId: 1,
            type: getQuestionAttributeSide(attribute),
            status: "pending",
            wrongAttempts: 0,
            answered: [],
            actualAnswers: [],
            totalAnswers: 1,
          });
        });
      }
    });
    const currentScore = await QuestionAnswerService.getOverallMarks(getCurrentUserId());
    set({
      questions: formattedQuestions,
      question: currentQuestion,
      score: currentScore,
    });
  },

  setActualAnswers: (id, actualAnswers) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (String(item.id) === String(id)) {
          return { ...item, actualAnswers: actualAnswers };
        } else {
          return item;
        }
      });
      return {
        questions: nextQuestions,
      };
    }),

  resetFrontend: () => {
    set((state) => ({
      questions: state.questions.map((question) => ({
        ...question,
        status: "pending",
        answered: [],
        wrongAttempts: 0,
        usedHint: false,
        attemptingId: question.actualAnswers?.[0]?.conditionId ?? 1,
      })),
      droppableData: Object.fromEntries(
        Object.keys(state.droppableData).map((key) => [key, []]),
      ),
    }));
  },

  setHintUsed: (id) =>
    set((state) => {
      const nextQuestions = state.questions.map((item) => {
        if (String(item.id) === String(id)) {
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
        if (String(item.id) === String(id)) {
          return {
            ...item,
            status: "wrong",
            wrongAttempts: (item.wrongAttempts || 0) + 1,
          };
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
        if (String(item.id) === String(id)) {
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
        if (String(item.id) === String(id)) {
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
        if (String(item.id) === String(id)) {
          return { ...item, attemptingId: attributeId };
        } else {
          return item;
        }
      });
      return { questions: nextQuestions };
    }),

  setTableData: (data) => {
    const allTablesData = Object.fromEntries(data.map((d) => [d, []]));

    set({ droppableData: allTablesData });
  },

  moveQuestion: (sourceId, targetId, condId, pairId, selectedAmount) =>
    set((state) => {
      const question = state.questions.find((item) => String(item.id) === String(sourceId));
      const separator = targetId.lastIndexOf("-");
      const myId = targetId.slice(0, separator);
      const operation = targetId.slice(separator + 1).toLowerCase();
      const existingRows = state.droppableData[myId];
      if (!question || !existingRows || !["add", "less"].includes(operation) ||
          question.answered.some((answer) => answer.conditionId === condId)) return state;

      const configuredAnswer = question.actualAnswers.find((answer) => answer.conditionId === condId);
      const amount = selectedAmount ?? configuredAnswer?.amount ?? question.amount;
      if (!Number.isFinite(Number(amount))) return state;
      const row = {
        id: question.id,
        questionAttributeId: question.questionAttributeId,
        attributeId: question.attributeId,
        conditionId: condId,
        name: question.name,
        amount: Number(amount),
        operation,
        pairId,
        isPaired: false,
      };
      // Pair against account identity, while each trial-balance row keeps its
      // own identity. Multiple deductions can therefore share one account.
      const pairIndex = existingRows.findIndex((item) =>
        item.operation !== operation &&
        ((pairId != null && String(item.attributeId) === String(pairId)) ||
         (item.pairId != null && String(item.pairId) === String(question.attributeId))));
      let updatedData = [...existingRows];
      if (pairIndex >= 0) {
        const counterpart = { ...updatedData[pairIndex], isPaired: true };
        row.isPaired = true;
        updatedData[pairIndex] = counterpart;
        updatedData.splice(pairIndex + (operation === "less" ? 1 : 0), 0, row);
        const pairedAccountId = operation === "less" ? pairId : question.attributeId;
        updatedData = updatedData.map((item) => item.operation === "add" &&
          String(item.attributeId) === String(pairedAccountId)
          ? { ...item, isPaired: true } : item);
      } else {
        updatedData.push(row);
      }
      const nextQuestions = state.questions.map((item) => {
        if (String(item.id) !== String(sourceId)) return item;
        const answered = [...item.answered, { conditionId: condId, answer: targetId }];
        return { ...item, answered, status: answered.length >= item.totalAnswers ? "solved" : "pending" };
      });
      return {
        questions: nextQuestions,
        droppableData: { ...state.droppableData, [myId]: updatedData },
      };
    }),
}));

export default useQuestionStore;
