import axios from "axios";

const BASE_URL = "http://localhost:8080/api/questions";

class QuestionService {
  getAll() {
    return axios.get(BASE_URL, {
      withCredentials: true,
    });
  }

  getQuestionText() {
    return axios.get(`${BASE_URL}/QuestionText`, {
      withCredentials: true,
    });
  }
  getQuestionsByMapping(courseId, chapterId, categoryId) {
    return axios.get(`${BASE_URL}/filter`, {
      params: {
        courseId,
        chapterId,
        categoryId,
      },
      withCredentials: true,
    });
  }
  getQuestionAnswers(id) {
    return axios.get(`${BASE_URL}/answers/${id}`, { withCredentials: true });
  }
  create(questionRequestDTO) {
    return axios.post(BASE_URL, questionRequestDTO, { withCredentials: true });
  }

  update(questionId, questionRequestDTO) {
    return axios.put(`${BASE_URL}/${questionId}`, questionRequestDTO, {
      withCredentials: true,
    });
  }

  getQuestionById(questionId) {
    return axios.get(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }
  deleteQuestion(id) {
    return axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
  }
}

export default new QuestionService();
