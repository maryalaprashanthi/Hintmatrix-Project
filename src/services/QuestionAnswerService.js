import apiClient from "./apiClient";

const QUESTION_ANSWER_URL = "/api/question_answers";

const ANSWER_EVENT_URL = "/api/answer_events";

const QuestionAnswerService = {
  processAnswerEvent: async (answerData) => {
    const response = await apiClient.post(ANSWER_EVENT_URL, answerData);

    return response.data;
  },

  saveAnswer: async (answerData) => {
    const response = await apiClient.post(QUESTION_ANSWER_URL, answerData);

    return response.data;
  },

  getAnswersByQuestionId: async (questionId) => {
    const response = await apiClient.get(
      `${QUESTION_ANSWER_URL}/question/${questionId}`,
    );

    return response.data;
  },

  getAnswersByUserAndQuestion: async (userId, questionId) => {
    const response = await apiClient.get(
      `${QUESTION_ANSWER_URL}/user/${userId}/question/${questionId}`,
    );

    return response.data;
  },

  // IMPORTANT: user + question
  getAnswerEventsByQuestionId: async (userId, questionId) => {
    const response = await apiClient.get(
      `${ANSWER_EVENT_URL}/user/${userId}/question/${questionId}`,
    );

    return response.data;
  },
  getMistakesByQuestionId: async (userId, questionId) => {
    const response = await apiClient.get(
      `${ANSWER_EVENT_URL}/user/${userId}/question/${questionId}/mistakes`,
    );

    return response.data;
  },

  resetAnswersByUserAndQuestion: async (userId, questionId) => {
    const response = await apiClient.put(
      `${QUESTION_ANSWER_URL}/user/${userId}/question/${questionId}/reset`,
    );

    return response.data;
  },

  resetAnswerEventsByUserAndQuestion: async (userId, questionId) => {
    const response = await apiClient.put(
      `${ANSWER_EVENT_URL}/user/${userId}/question/${questionId}/reset`,
    );

    return response.data;
  },

  getOverallMarks: async (userId) => {
    const response = await apiClient.get(
      `${ANSWER_EVENT_URL}/user/${userId}/marks`,
    );

    return response.data;
  },
};

export default QuestionAnswerService;

