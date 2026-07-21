import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/exam-question")
const BASE_URL = "http://localhost:8080/api/exam-question";

class ExamQuestionService {

    // Matches @PostMapping
    // Takes the ExamQuestionRequestDTO payload for the request body
    create(examQuestionRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            examQuestionRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    // Returns an array of ExamQuestionResponseDTO objects
    getAll() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    // Returns a specific ExamQuestion entity structure
    getById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, examQuestionRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            examQuestionRequestDTO,
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
export default new ExamQuestionService();
