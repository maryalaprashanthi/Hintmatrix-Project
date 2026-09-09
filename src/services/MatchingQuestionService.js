import apiClient from "./apiClient";

const BASE_URL = "/api/questions/matching";

class MatchingQuestionService {
  create(request) {
    return apiClient.post(BASE_URL, request, {
      withCredentials: true,
    });
  }

  getAll() {
    return apiClient.get(BASE_URL, {
      withCredentials: true,
    });
  }

  getById(questionId) {
    return apiClient.get(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }

  update(questionId, request) {
    return apiClient.put(
      `${BASE_URL}/${questionId}`,
      request,
      {
        withCredentials: true,
      }
    );
  }

  delete(questionId) {
    return apiClient.delete(
      `${BASE_URL}/${questionId}`,
      {
        withCredentials: true,
      }
    );
  }
}

export default new MatchingQuestionService();