import apiClient from "./apiClient";

// Matches the Spring Boot Controller's @RequestMapping("/api/users")
const BASE_URL = "/api/users";

class UserService {
  // =========================
  // SUPER ADMIN
  // =========================

  createSuperAdmin(superAdminRequestDTO) {
    return apiClient.post(`${BASE_URL}/superAdmin`, superAdminRequestDTO, {
      withCredentials: true,
    });
  }

  getAllSuperAdmins() {
    return apiClient.get(`${BASE_URL}/superAdmins`, { withCredentials: true });
  }

  updateSuperAdmin(id, superAdminRequestDTO) {
    return apiClient.put(`${BASE_URL}/superAdmin/${id}`, superAdminRequestDTO, {
      withCredentials: true,
    });
  }

  deleteSuperAdmin(id) {
    return apiClient.delete(`${BASE_URL}/superAdmin/${id}`, {
      withCredentials: true,
    });
  }

  // =========================
  // BRANCH ADMIN
  // =========================

  createBranchAdmin(branchAdminRequestDTO) {
    return apiClient.post(`${BASE_URL}/branchAdmin`, branchAdminRequestDTO, {
      withCredentials: true,
    });
  }

  getAllBranchAdmins() {
    return apiClient.get(`${BASE_URL}/branchAdmins`, { withCredentials: true });
  }

  updateBranchAdmin(id, branchAdminRequestDTO) {
    return apiClient.put(`${BASE_URL}/branchAdmin/${id}`, branchAdminRequestDTO, {
      withCredentials: true,
    });
  }

  deleteBranchAdmin(id) {
    return apiClient.delete(`${BASE_URL}/branchAdmin/${id}`, {
      withCredentials: true,
    });
  }

  // =========================
  // STUDENT
  // =========================

  createStudent(studentRequestDTO) {
    return apiClient.post(`${BASE_URL}/student`, studentRequestDTO, {
      withCredentials: true,
    });
  }

  getAllStudents() {
    return apiClient.get(`${BASE_URL}/students`, { withCredentials: true });
  }

  updateStudent(id, studentRequestDTO) {
    return apiClient.put(`${BASE_URL}/student/${id}`, studentRequestDTO, {
      withCredentials: true,
    });
  }

  deleteStudent(id) {
    return apiClient.delete(`${BASE_URL}/student/${id}`, { withCredentials: true });
  }

  uploadUsersExcel(file) {

  const formData = new FormData();

  formData.append("file", file);


  return apiClient.post(
    `${BASE_URL}/excel/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );
}

}

// Export an instantiated instance of the service
export default new UserService();

