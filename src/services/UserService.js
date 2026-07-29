import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/users")
const BASE_URL = "http://localhost:8080/api/users";

class UserService {
  // =========================
  // SUPER ADMIN
  // =========================

  createSuperAdmin(superAdminRequestDTO) {
    return axios.post(`${BASE_URL}/superAdmin`, superAdminRequestDTO, {
      withCredentials: true,
    });
  }

  getAllSuperAdmins() {
    return axios.get(`${BASE_URL}/superAdmins`, { withCredentials: true });
  }

  updateSuperAdmin(id, superAdminRequestDTO) {
    return axios.put(`${BASE_URL}/superAdmin/${id}`, superAdminRequestDTO, {
      withCredentials: true,
    });
  }

  deleteSuperAdmin(id) {
    return axios.delete(`${BASE_URL}/superAdmin/${id}`, {
      withCredentials: true,
    });
  }

  // =========================
  // BRANCH ADMIN
  // =========================

  createBranchAdmin(branchAdminRequestDTO) {
    return axios.post(`${BASE_URL}/branchAdmin`, branchAdminRequestDTO, {
      withCredentials: true,
    });
  }

  getAllBranchAdmins() {
    return axios.get(`${BASE_URL}/branchAdmins`, { withCredentials: true });
  }

  updateBranchAdmin(id, branchAdminRequestDTO) {
    return axios.put(`${BASE_URL}/branchAdmin/${id}`, branchAdminRequestDTO, {
      withCredentials: true,
    });
  }

  deleteBranchAdmin(id) {
    return axios.delete(`${BASE_URL}/branchAdmin/${id}`, {
      withCredentials: true,
    });
  }

  // =========================
  // STUDENT
  // =========================

  createStudent(studentRequestDTO) {
    return axios.post(`${BASE_URL}/student`, studentRequestDTO, {
      withCredentials: true,
    });
  }

  getAllStudents() {
    return axios.get(`${BASE_URL}/students`, { withCredentials: true });
  }

  updateStudent(id, studentRequestDTO) {
    return axios.put(`${BASE_URL}/student/${id}`, studentRequestDTO, {
      withCredentials: true,
    });
  }

  deleteStudent(id) {
    return axios.delete(`${BASE_URL}/student/${id}`, { withCredentials: true });
  }
}

// Export an instantiated instance of the service
export default new UserService();
