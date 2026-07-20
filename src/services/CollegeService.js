import axios from "axios";

// Updated root URL mapping to match the Controller's @RequestMapping("/api/college")
const BASE_URL = "http://localhost:8080/api/college";

class CollegeService {

    // Matches @PostMapping
    saveCollege(collegeRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            collegeRequestDTO,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Matches @GetMapping
    getAllColleges() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes your active login session cookie
        );
    }

    // Matches @GetMapping("/{id}")
    getCollegeById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    updateCollege(id, collegeRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            collegeRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    deleteCollege(id) {
        return axios.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

export default new CollegeService();
