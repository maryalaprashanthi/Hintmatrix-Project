import apiClient from "./apiClient";

const BASE_URL = "/api/performance/practice";

export const PRACTICE_LEVELS = ["course", "subject", "chapter", "topic"];

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

// Practice performance from practice_results (the current state of each unit).
// The server works out the caller's own scope from the login; the optional
// params only narrow it:
//   courseId / subjectId / chapterId  - hierarchy (each level applies the ones
//                                       it has a column for)
//   collegeId / branchId / studentId  - which students
const PracticePerformanceService = {
  getMyQuestionStatuses(topicId) {
    return apiClient.get(`${BASE_URL}/question-statuses`, {
      params: cleanParams({ topicId }),
    });
  },
  getMyQuestionCompletion(level, params = {}) {
    return apiClient.get(`${BASE_URL}/completion/${level}`, {
      params: cleanParams(params),
    });
  },
  getLevel(level, params = {}) {
    return apiClient.get(`${BASE_URL}/${level}`, {
      params: cleanParams(params),
    });
  },

  getMyLevel(level, params = {}) {
    return apiClient.get(`${BASE_URL}/mine/${level}`, {
      params: cleanParams(params),
    });
  },

  getTimeline(params = {}) {
    return apiClient.get(`${BASE_URL}/timeline`, {
      params: cleanParams(params),
    });
  },

  getStudentsNeedingSupport(params = {}) {
    return apiClient.get(`${BASE_URL}/students-needing-support`, {
      params: cleanParams(params),
    });
  },
};

export default PracticePerformanceService;
