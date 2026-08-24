import apiClient from "./apiClient";

const BASE_URL = "/api/dashboard";

class DashboardService {
  getDashboardData() {
    return apiClient.get(
      `${BASE_URL}`,
      { withCredentials: true }, // Passes authorization cookie
    );
  }
}

export default new DashboardService();

