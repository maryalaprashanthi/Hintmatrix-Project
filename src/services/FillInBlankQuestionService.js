import apiClient from "./apiClient";

const BASE_URL = "/api/questions/fill-blank";

class FillInBlankQuestionService {
  create(request) {
    return apiClient.post(BASE_URL, request, {
      withCredentials: true,
    });
  }

  getById(questionId) {
    return apiClient.get(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }

  update(questionId, request) {
    return apiClient.put(`${BASE_URL}/${questionId}`, request, {
      withCredentials: true,
    });
  }
}

export default new FillInBlankQuestionService();
