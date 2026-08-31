import apiClient from "./apiClient";

const BASE_URL = "/api/mcq-questions";

class McqQuestionService {
  create(request) {
    return apiClient.post(BASE_URL, request, { withCredentials: true });
  }

  getAll() {
    return apiClient.get(BASE_URL, { withCredentials: true });
  }

  getById(questionId) {
    return apiClient.get(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }

  getByFilter(courseId, chapterId, categoryId) {
    return apiClient.get(`${BASE_URL}/filter`, {
      params: { courseId, chapterId, categoryId },
      withCredentials: true,
    });
  }

  update(questionId, request) {
    return apiClient.put(`${BASE_URL}/${questionId}`, request, {
      withCredentials: true,
    });
  }

  delete(questionId) {
    return apiClient.delete(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }

  submit(userId, answers) {
    return apiClient.post(
      `${BASE_URL}/submit`,
      { userId, answers },
      { withCredentials: true },
    );
  }
}

export default new McqQuestionService();
