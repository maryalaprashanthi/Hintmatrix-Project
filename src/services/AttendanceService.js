import axios from "axios";

const BASE_URL = "http://localhost:8080/api/attendance";

const AttendanceService = {
  // Get all attendance
  getAllAttendance: async () => {
    const response = await axios.get(BASE_URL, {
      withCredentials: true,
    });

    return response.data;
  },

  // Get attendance by ID
  getAttendanceById: async (attendanceId) => {
    const response = await axios.get(`${BASE_URL}/${attendanceId}`, {
      withCredentials: true,
    });

    return response.data;
  },

  // Upload Excel
  uploadExcel: async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Create attendance
  createAttendance: async (data) => {
    const response = await axios.post(BASE_URL, data, {
      withCredentials: true,
    });

    return response.data;
  },

  // Update attendance
  updateAttendance: async (attendanceId, data) => {
    const response = await axios.put(`${BASE_URL}/${attendanceId}`, data, {
      withCredentials: true,
    });

    return response.data;
  },

  // Delete attendance
  deleteAttendance: async (attendanceId) => {
    const response = await axios.delete(`${BASE_URL}/${attendanceId}`, {
      withCredentials: true,
    });

    return response.data;
  },
};

export default AttendanceService;
