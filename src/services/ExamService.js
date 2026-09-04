import apiClient from "./apiClient";

const BASE_URL = "/api/exams";

class ExamService {
  // Create exam
  create(examRequestDTO) {
    return apiClient.post(`${BASE_URL}`, examRequestDTO, { withCredentials: true });
  }

  // Get all exams
  getAll() {
    return apiClient.get(`${BASE_URL}`, { withCredentials: true });
  }

  // Get exam by ID
  getById(id) {
    return apiClient.get(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Update exam
  update(id, examRequestDTO) {
    return apiClient.put(`${BASE_URL}/${id}`, examRequestDTO, {
      withCredentials: true,
    });
  }

  // Delete exam
  delete(id) {
    return apiClient.delete(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Add questions to exam
  addQuestions(examId, questionIds) {
    return apiClient.post(
      `${BASE_URL}/${examId}/questions`,
      {
        questionIds: questionIds,
      },
      { withCredentials: true },
    );
  }

  // Get questions already added to exam
  getExamQuestions(examId) {
    return apiClient.get(`${BASE_URL}/${examId}/questions`, {
      withCredentials: true,
    });
  }

  // Submit a student's attempt for marking
  // POST /api/exams/{examId}/submit  ->  { examId, userId, totalMarks, percentage }
  submitExam(examId, submissionDTO) {
    return apiClient.post(`${BASE_URL}/${examId}/submit`, submissionDTO, {
      withCredentials: true,
    });
  }

  // Get questions available for exam
  getAvailableQuestions(examId) {
    return apiClient.get(`${BASE_URL}/${examId}/available-questions`, {
      withCredentials: true,
    });
  }

  // Remove question from exam
  removeQuestion(examId, questionId) {
    return apiClient.delete(`${BASE_URL}/${examId}/questions/${questionId}`, {
      withCredentials: true,
    });
  }
}

export default new ExamService();

