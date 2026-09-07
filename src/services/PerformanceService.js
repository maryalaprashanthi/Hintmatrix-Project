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
};

export default PerformanceService;
