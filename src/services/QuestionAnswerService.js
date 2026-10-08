import apiClient from "./apiClient";

const QUESTION_ANSWER_URL = "/api/question_answers";

import PracticeResultService from "./PracticeResultService";

const ANSWER_EVENT_URL = "/api/answer_events";

const QuestionAnswerService = {
  processAnswerEvent: async (answerData) => {
    // Other question types retain their existing payload. Final-accounts
    // drag/drop supplies a question-row identity for backend validation.
    const { unitPosition } = answerData;
    const eventData = { ...answerData };
    if (answerData.finalAccounts !== true) {
      delete eventData.questionAttributeId;
    }
    delete eventData.unitPosition;
    const response = await apiClient.post(ANSWER_EVENT_URL, eventData);

    const event = response.data;
    if (event.answerEventId && event.isCorrect !== null &&
        event.isCorrect !== undefined && event.eventType !== "AUTOFILL") {
      const result = {
        answerEventId: event.answerEventId,
        unitPosition,
      };
      try {
        await PracticeResultService.recordFromEvent(result);
      } catch {
        // The backend applies each saved event only once, so this retry is safe.
        try {
          await PracticeResultService.recordFromEvent(result);
        } catch (practiceError) {
          // Keep the existing saved-answer flow working if performance is unavailable.
          console.error("Practice result could not be recorded", practiceError);
        }
      }
    }

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

  getMistakesByUserId: async (userId) => {
    const response = await apiClient.get(
      `${ANSWER_EVENT_URL}/user/${userId}/mistakes`,
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
