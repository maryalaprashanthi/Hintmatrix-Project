import apiClient from "./apiClient";

const BASE_URL = "/api/questions";

class QuestionService {
  getAll() {
    return apiClient.get(BASE_URL, {
      withCredentials: true,
    });
  }

  getQuestionText() {
    return apiClient.get(`${BASE_URL}/QuestionText`, {
      withCredentials: true,
    });
  }
  getQuestionsByMapping(courseId, chapterId, categoryId) {
    return apiClient.get(`${BASE_URL}/filter`, {
      params: {
        courseId,
        chapterId,
        categoryId,
      },
      withCredentials: true,
    });
  }
  getQuestionAnswers(id) {
    return apiClient.get(`${BASE_URL}/answers/${id}`, { withCredentials: true });
  }
  create(questionRequestDTO) {
    return apiClient.post(BASE_URL, questionRequestDTO, { withCredentials: true });
  }

  update(questionId, questionRequestDTO) {
    return apiClient.put(`${BASE_URL}/${questionId}`, questionRequestDTO, {
      withCredentials: true,
    });
  }

  getQuestionById(questionId) {
    return apiClient.get(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }
  deleteQuestion(id) {
    return apiClient.delete(`${BASE_URL}/${id}`, { withCredentials: true });
  }
}

export default new QuestionService();

