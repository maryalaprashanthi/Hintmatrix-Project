import axios from "axios";

const API_URL = "http://localhost:8080";

class CourseService {

    // Save Course
    saveCourse(course) {
        return axios.post(
            `${API_URL}/saveCourse`, 
            course,
            { withCredentials: true } // ◄— Passes your active login cookie
        );
    }

    // Get All Courses
    getAllCourses() {
        return axios.get(
            `${API_URL}/getAllCourses`,
            { withCredentials: true } // ◄— Passes your active login cookie
        );
    }

    // Get Course By Id
    getCourseById(id) {
        return axios.get(
            `${API_URL}/getCourseById/${id}`,
            { withCredentials: true }
        );
    }

    // Update Course
    updateCourse(course) {
        return axios.put(
            `${API_URL}/updateCourse`, 
            course,
            { withCredentials: true }
        );
    }

    // Delete Course
    deleteCourse(id) {
        return axios.delete(
            `${API_URL}/deleteCourse/${id}`,
            { withCredentials: true }
        );
    }
}

export default new CourseService();
