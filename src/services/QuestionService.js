import axios from "axios";

const BASE_URL = "http://localhost:8080/api/questions";

class QuestionService {
  getQuestionText() {
    return axios.get(`${BASE_URL}/QuestionText`, {
      withCredentials: true,
    });
  }
}

export default new QuestionService();
