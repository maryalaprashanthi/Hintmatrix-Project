import axios from "axios";

// Updated root URL mapping to match the Controller's @RequestMapping("/api/course")
const API_URL = "http://localhost:8080/api/course";

class CourseService {

    // Save Course - Matches @PostMapping
    saveCourse(courseRequestDTO) {
        return axios.post(
            `${API_URL}`, 
            courseRequestDTO,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Get All Courses - Matches @GetMapping
    getAllCourses() {
        return axios.get(
            `${API_URL}`,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Get Course By Id - Matches @GetMapping("/{id}")
    getCourseById(id) {
        return axios.get(
            `${API_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Update Course - Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    updateCourse(id, courseRequestDTO) {
        return axios.put(
            `${API_URL}/${id}`, 
            courseRequestDTO,
            { withCredentials: true }
        );
    }

    // Delete Course - Matches @DeleteMapping("/{id}")
    deleteCourse(id) {
        return axios.delete(
            `${API_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

export default new CourseService();
