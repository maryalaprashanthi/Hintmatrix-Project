import axios from "axios";

const QUESTION_ANSWER_URL = "http://localhost:8080/api/question_answers";

const ANSWER_EVENT_URL = "http://localhost:8080/api/answer_events";

const QuestionAnswerService = {
  processAnswerEvent: async (answerData) => {
    const response = await axios.post(ANSWER_EVENT_URL, answerData);

    return response.data;
  },

  saveAnswer: async (answerData) => {
    const response = await axios.post(QUESTION_ANSWER_URL, answerData);

    return response.data;
  },

  getAnswersByQuestionId: async (questionId) => {
    const response = await axios.get(
      `${QUESTION_ANSWER_URL}/question/${questionId}`,
    );

    return response.data;
  },

  getAnswersByUserAndQuestion: async (userId, questionId) => {
    const response = await axios.get(
      `${QUESTION_ANSWER_URL}/user/${userId}/question/${questionId}`,
    );

    return response.data;
  },

  // IMPORTANT: user + question
  getAnswerEventsByQuestionId: async (userId, questionId) => {
    const response = await axios.get(
      `${ANSWER_EVENT_URL}/user/${userId}/question/${questionId}`,
    );

    return response.data;
  },
  getMistakesByQuestionId: async (userId, questionId) => {
    const response = await axios.get(
      `${ANSWER_EVENT_URL}/user/${userId}/question/${questionId}/mistakes`,
    );

    return response.data;
  },

  resetAnswersByUserAndQuestion: async (userId, questionId) => {
    const response = await axios.put(
      `${QUESTION_ANSWER_URL}/user/${userId}/question/${questionId}/reset`,
    );

    return response.data;
  },

  resetAnswerEventsByUserAndQuestion: async (userId, questionId) => {
    const response = await axios.put(
      `${ANSWER_EVENT_URL}/user/${userId}/question/${questionId}/reset`,
    );

    return response.data;
  },

  getOverallMarks: async (userId) => {
    const response = await axios.get(
      `${ANSWER_EVENT_URL}/user/${userId}/marks`,
    );

    return response.data;
  },
};

export default QuestionAnswerService;
