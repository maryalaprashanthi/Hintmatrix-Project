import axios from "axios";

const BASE_URL = "http://localhost:8080/api/exams";

class ExamService {
  // Create exam
  create(examRequestDTO) {
    return axios.post(`${BASE_URL}`, examRequestDTO, { withCredentials: true });
  }

  // Get all exams
  getAll() {
    return axios.get(`${BASE_URL}`, { withCredentials: true });
  }

  // Get exam by ID
  getById(id) {
    return axios.get(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Update exam
  update(id, examRequestDTO) {
    return axios.put(`${BASE_URL}/${id}`, examRequestDTO, {
      withCredentials: true,
    });
  }

  // Delete exam
  delete(id) {
    return axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Add questions to exam
  addQuestions(examId, questionIds) {
    return axios.post(
      `${BASE_URL}/${examId}/questions`,
      {
        questionIds: questionIds,
      },
      { withCredentials: true },
    );
  }

  // Get questions already added to exam
  getExamQuestions(examId) {
    return axios.get(`${BASE_URL}/${examId}/questions`, {
      withCredentials: true,
    });
  }

  // Get questions available for exam
  getAvailableQuestions(examId) {
    return axios.get(`${BASE_URL}/${examId}/available-questions`, {
      withCredentials: true,
    });
  }

  // Remove question from exam
  removeQuestion(examId, questionId) {
    return axios.delete(`${BASE_URL}/${examId}/questions/${questionId}`, {
      withCredentials: true,
    });
  }
}

export default new ExamService();
