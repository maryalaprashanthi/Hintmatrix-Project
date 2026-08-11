import axios from "axios";

const QUESTION_ANSWER_URL = "http://localhost:8080/api/question_answers";

const ANSWER_EVENT_URL = "http://localhost:8080/api/answer-events";

const QuestionAnswerService = {
  processAnswerEvent: async (answerData) => {
    const response = await axios.post(ANSWER_EVENT_URL, answerData);

    return response.data;
  },

  getAnswersByQuestionId: async (questionId) => {
    const response = await axios.get(
      `${QUESTION_ANSWER_URL}/question/${questionId}`,
    );

    return response.data;
  },

  getAnswerEventsByQuestionId: async (questionId) => {
    const response = await axios.get(
      `${ANSWER_EVENT_URL}/question/${questionId}`,
    );

    return response.data;
  },

  getMistakesByQuestionId: async (questionId) => {
    const response = await axios.get(
      `${ANSWER_EVENT_URL}/question/${questionId}/mistakes`,
    );

    return response.data;
  },

  resetAnswersByQuestionId: async (questionId) => {
    const response = await axios.put(
      `${QUESTION_ANSWER_URL}/question/${questionId}/reset`,
    );

    return response.data;
  },
};

export default QuestionAnswerService;
