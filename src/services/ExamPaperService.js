import apiClient from "./apiClient";

class ExamPaperService {
  createExamPaper(payload) {
    const examPayload = {
      examName: payload.examName,
      collegeId: payload.college ?? payload.collegeId ?? null,
      branchId: payload.branch ?? payload.branchId ?? null,
      courseId: payload.course ?? payload.courseId ?? null,
      sectionId: payload.section ?? payload.sectionId ?? null,
      chapterIds:
        payload.chapters?.map((item) => item.value ?? item) ||
        payload.chapterIds ||
        [],
      startDate:
        payload.startDate && payload.startTime
          ? `${payload.startDate}T${payload.startTime}:00`
          : payload.startDate || null,
      endDate:
        payload.endDate && payload.endTime
          ? `${payload.endDate}T${payload.endTime}:00`
          : payload.endDate || null,
      passPercentage: payload.passPercentage ?? 35,
    };

    return apiClient.post("/api/exams", examPayload, {
      withCredentials: true,
    });
  }

  addQuestionsToExam(examId, questionIds) {
    return apiClient.post(
      `/api/exams/${examId}/questions`,
      { questionIds },
      { withCredentials: true },
    );
  }

  createExamPaperWithQuestions(payload) {
    const { questionIds, ...examPayload } = payload;

    return this.createExamPaper(examPayload).then((response) => {
      const examId = response?.data?.id ?? response?.data?.examId;

      if (!examId || !Array.isArray(questionIds) || questionIds.length === 0) {
        return response;
      }

      return this.addQuestionsToExam(examId, questionIds).then(() => response);
    });
  }
}

export default new ExamPaperService();
