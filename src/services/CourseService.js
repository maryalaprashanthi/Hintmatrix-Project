import apiClient from "./apiClient";

// Updated root URL mapping to match the Controller's @RequestMapping("/api/course")
const API_URL = "/api/course";

class CourseService {

    // Save Course - Matches @PostMapping
    saveCourse(courseRequestDTO) {
        return apiClient.post(
            `${API_URL}`, 
            courseRequestDTO,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Get All Courses - Matches @GetMapping
    getAllCourses() {
        return apiClient.get(
            `${API_URL}`,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Get Course By Id - Matches @GetMapping("/{id}")
    getCourseById(id) {
        return apiClient.get(
            `${API_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Update Course - Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    updateCourse(id, courseRequestDTO) {
        return apiClient.put(
            `${API_URL}/${id}`, 
            courseRequestDTO,
            { withCredentials: true }
        );
    }

    // Delete Course - Matches @DeleteMapping("/{id}")
    deleteCourse(id) {
        return apiClient.delete(
            `${API_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Upload Excel (.xls, .xlsx, .xlsm)
uploadExcel(file) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(
        `${API_URL}/upload`,
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

export default new CourseService();

