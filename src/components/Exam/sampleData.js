import QuestionService from "../../services/QuestionService";

export const examQuestionIds = [2, 3, 4];
export let sampleQuestions = [];

export const loadSampleQuestions = async () => {
  sampleQuestions = await Promise.all(
    examQuestionIds.map(async (questionId) => {
      const response = await QuestionService.getQuestionById(questionId);
      return { id: questionId, question: response.data };
    }),
  );

  return sampleQuestions;
};
