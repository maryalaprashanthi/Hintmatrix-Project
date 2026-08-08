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

  getQuestionAnswers(id) {
    return axios.get(`${BASE_URL}/answers/${id}`, { withCredentials: true });
  }

  getQuestionById(questionId) {
    return axios.get(`${BASE_URL}/${questionId}`, {
      withCredentials: true,
    });
  }
}

export default new QuestionService();
