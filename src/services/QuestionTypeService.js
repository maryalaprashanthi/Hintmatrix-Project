import apiClient from "./apiClient";

const BASE_URL = "/api/question-types";

class QuestionTypeService {
  getAll() {
    return apiClient.get(BASE_URL, {
      withCredentials: true,
    });
  }

  getById(id) {
    return apiClient.get(`${BASE_URL}/${id}`, {
      withCredentials: true,
    });
  }
}

export default new QuestionTypeService();
