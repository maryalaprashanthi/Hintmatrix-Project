import apiClient from "./apiClient";

// Updated root URL mapping to match the Controller's @RequestMapping("/api/college")
const BASE_URL = "/api/college";

class CollegeService {

    // Matches @PostMapping
    saveCollege(collegeRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            collegeRequestDTO,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Matches @GetMapping
    getAllColleges() {
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Matches @GetMapping("/{id}")
    getCollegeById(id) {
        return apiClient.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    updateCollege(id, collegeRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            collegeRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    deleteCollege(id) {
        return apiClient.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Upload Excel (.xls, .xlsx, .xlsm)
uploadExcel(file) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(
        `${BASE_URL}/upload`,
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

export default new CollegeService();

