import apiClient from "./apiClient";

const BASE_URL = "/api/performance";

const cleanFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

const PerformanceService = {
  getCollegePerformance(filters = {}) {
    return apiClient.get(`${BASE_URL}/college`, {
      params: cleanFilters(filters),
      withCredentials: true,
    });
  },

  getBranchPerformance(filters = {}) {
    return apiClient.get(`${BASE_URL}/branch`, {
      params: cleanFilters(filters),
      withCredentials: true,
    });
  },

  getSuperAdminPerformance(filters = {}) {
    return apiClient.get(`${BASE_URL}/super-admin`, {
      params: cleanFilters(filters),
      withCredentials: true,
    });
  },

  getStudentPerformance() {
    return apiClient.get(`${BASE_URL}/student`, {
      withCredentials: true,
    });
  },

  // One exam attempt's chapter-by-chapter marks - the trend chart's
  // drill-down when an admin clicks a bar that is one student's own result.
  getExamResultChapterBreakdown(resultId) {
    return apiClient.get(`${BASE_URL}/exam-results/${resultId}/chapters`, {
      withCredentials: true,
    });
  },
};

export default PerformanceService;
