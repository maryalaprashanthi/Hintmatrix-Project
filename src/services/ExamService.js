import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/exam")
const BASE_URL = "http://localhost:8080/api/exam";

class ExamService {

    // Matches @PostMapping
    // Takes the ExamRequestDTO payload for the request body
    create(examRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            examRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    // Returns an array of ExamResponseDTO objects
    getAll() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    // Returns a specific Exam entity structure
    getById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, examRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            examRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    // Returns plain string text confirmation from backend layer
    delete(id) {
        return axios.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

// Export an instantiated instance of the service architecture directly
export default new ExamService();
