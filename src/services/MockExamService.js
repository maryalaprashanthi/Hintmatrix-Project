import apiClient from "./apiClient";

// Talks to MockExamController (/api/mock-exams). A mock exam is scoped only to
// a course + chapters + pass %, so create/update take:
//   { mockExamName, courseId, chapterIds, passPercentage }
const BASE_URL = "/api/mock-exams";

class MockExamService {
  // Create mock exam
  create(mockExamRequestDTO) {
    return apiClient.post(`${BASE_URL}`, mockExamRequestDTO, {
      withCredentials: true,
    });
  }

  // Get all mock exams
  getAll() {
    return apiClient.get(`${BASE_URL}`, { withCredentials: true });
  }

  // Get mock exam by ID
  getById(id) {
    return apiClient.get(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Update mock exam
  update(id, examRequestDTO) {
    return apiClient.put(`${BASE_URL}/${id}`, examRequestDTO, {
      withCredentials: true,
    });
  }

  // Delete mock exam
  delete(id) {
    return apiClient.delete(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Add questions to mock exam
  addQuestions(examId, questionIds) {
    return apiClient.post(
      `${BASE_URL}/${examId}/questions`,
      {
        questionIds: questionIds,
      },
      { withCredentials: true },
    );
  }

  // Get questions already added to the mock exam
  getExamQuestions(examId) {
    return apiClient.get(`${BASE_URL}/${examId}/questions`, {
      withCredentials: true,
    });
  }

  // Submit a student's attempt for marking
  // POST /api/mock-exams/{examId}/submit  ->  { examId, userId, totalMarks, percentage }
  submitExam(examId, submissionDTO) {
    return apiClient.post(`${BASE_URL}/${examId}/submit`, submissionDTO, {
      withCredentials: true,
    });
  }

  // Get questions available for the mock exam
  getAvailableQuestions(examId) {
    return apiClient.get(`${BASE_URL}/${examId}/available-questions`, {
      withCredentials: true,
    });
  }

  // Remove question from the mock exam
  removeQuestion(examId, questionId) {
    return apiClient.delete(`${BASE_URL}/${examId}/questions/${questionId}`, {
      withCredentials: true,
    });
  }

  // Full review payload for one completed attempt (Exam Review screen)
  getResultReview(examId, resultId) {
    return apiClient.get(`${BASE_URL}/${examId}/results/${resultId}`, {
      withCredentials: true,
    });
  }

  // Every completed mock-exam attempt for the logged-in user, newest first
  getMyAttempts() {
    return apiClient.get(`${BASE_URL}/results/me`, { withCredentials: true });
  }

  // Hint + wrong answer_events for one attribute on one attempt - the
  // "What went wrong?" panel when a trial-balance / transaction row is clicked
  getAttributeReviewDetail(mockExamId, resultId, questionId, attributeId) {
    return apiClient.get(
      `${BASE_URL}/${mockExamId}/results/${resultId}/attributes/${attributeId}/review-detail`,
      { params: { questionId }, withCredentials: true },
    );
  }
}

export default new MockExamService();
