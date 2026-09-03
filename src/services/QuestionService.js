import apiClient from "./apiClient";
import axios from "axios";

const BASE_URL = "/api/questions";
const BASE_QUESTION_URL = "http://localhost:8080/api/questions";

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
    return apiClient.get(`${BASE_URL}/answers/${id}`, {
      withCredentials: true,
    });
  }
  create(questionRequestDTO) {
    return apiClient.post(BASE_URL, questionRequestDTO, {
      withCredentials: true,
    });
  }

  update(questionId, questionRequestDTO) {
    return apiClient.put(`${BASE_URL}/${questionId}`, questionRequestDTO, {
      withCredentials: true,
    });
  }

  uploadExcel(formData) {
    return axios.post(`${BASE_QUESTION_URL}/upload`, formData, {
      withCredentials: true,
    });
  }

  uploadMcqExcel(formData) {
  return axios.post("http://localhost:8080/api/mcq-questions/mcq/upload", formData, {
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
