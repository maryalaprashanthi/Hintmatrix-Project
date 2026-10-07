import apiClient from "./apiClient";

const BASE_URL = "/api/dashboard";

class DashboardService {
  getDashboardData(options = {}) {
    return apiClient.get(
      `${BASE_URL}`,
      { ...options, withCredentials: true }, // Passes authorization cookie
    );
  }
}

export default new DashboardService();

