import apiClient from "./apiClient";
import { isGuestUser } from "../utils/userEdit";
import { currentRole, ROLES } from "../utils/roles";

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
  // COLLEGE ADMIN
  // =========================

  createCollegeAdmin(collegeAdminRequestDTO) {
    return apiClient.post(`${BASE_URL}/collegeAdmin`, collegeAdminRequestDTO, {
      withCredentials: true,
    });
  }

  getAllCollegeAdmins() {
    return apiClient.get(`${BASE_URL}/collegeAdmin`, {
      withCredentials: true,
    });
  }
  getCollegeAdminById(id) {
    return apiClient.get(`${BASE_URL}/collegeAdmin/${id}`, {
      withCredentials: true,
    });
  }

  updateCollegeAdmin(id, collegeAdminRequestDTO) {
    return apiClient.put(
      `${BASE_URL}/collegeAdmin/${id}`,
      collegeAdminRequestDTO,
      {
        withCredentials: true,
      },
    );
  }

  deleteCollegeAdmin(id) {
    return apiClient.delete(`${BASE_URL}/collegeAdmin/${id}`, {
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
    return apiClient.put(
      `${BASE_URL}/branchAdmin/${id}`,
      branchAdminRequestDTO,
      {
        withCredentials: true,
      },
    );
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
    const path = currentRole() === ROLES.SUPER_ADMIN ? "students_Guest" : "students";
    return apiClient.get(`${BASE_URL}/${path}`, {
      withCredentials: true,
    });
  }

  updateStudent(id, studentRequestDTO) {
    return apiClient.put(`${BASE_URL}/student/${id}`, studentRequestDTO, {
      withCredentials: true,
    });
  }

  updateGuest(id, guestRequestDTO) {
    if (currentRole() !== ROLES.SUPER_ADMIN) return Promise.reject(new Error("Only Super Admin can edit guests."));
    return apiClient.put(`${BASE_URL}/guest/${id}`, guestRequestDTO, {
      withCredentials: true,
    });
  }

  updateStudentOrGuest(user, request) {
    const id = user.userId || user.studentId;
    return isGuestUser(user) ? this.updateGuest(id, request) : this.updateStudent(id, request);
  }

  deleteGuest(id) {
    if (currentRole() !== ROLES.SUPER_ADMIN) return Promise.reject(new Error("Only Super Admin can delete guests."));
    return apiClient.delete(`${BASE_URL}/guest/${id}`, { withCredentials: true });
  }

  deleteStudentOrGuest(user) {
    const id = user.userId || user.user_id || user.studentId;
    return isGuestUser(user) ? this.deleteGuest(id) : this.deleteStudent(id);
  }

  deleteStudent(id) {
    return apiClient.delete(`${BASE_URL}/student/${id}`, {
      withCredentials: true,
    });
  }

  uploadUsersExcel(file) {
    const formData = new FormData();

    formData.append("file", file);

    return apiClient.post(`${BASE_URL}/excel/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
  }
}

// Export an instantiated instance of the service
export default new UserService();
