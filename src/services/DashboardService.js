import axios from "axios";

const BASE_URL = "http://localhost:8080/api/dashboard";

class DashboardService {
  getDashboardData() {
    return axios.get(
      `${BASE_URL}`,
      { withCredentials: true }, // Passes authorization cookie
    );
  }
}

export default new DashboardService();
