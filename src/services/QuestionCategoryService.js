import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/question-categories")
const BASE_URL = "http://localhost:8080/api/question-categories";

class QuestionCategoryService {

    // Matches @PostMapping
    // Takes the QuestionCategoryRequestDTO payload for the request body
    create(questionCategoryRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            questionCategoryRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    // Returns an array of QuestionCategoryResponseDTO objects
    getAll() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    // Returns a specific QuestionCategoryResponseDTO object
    getById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, questionCategoryRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            questionCategoryRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    delete(id) {
        return axios.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

// Export an instantiated instance of the service architecture directly
export default new QuestionCategoryService();

