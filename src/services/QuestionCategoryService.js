import apiClient from "./apiClient";

// Matches the Spring Boot Controller's @RequestMapping("/api/question-categories")
const BASE_URL = "/api/question-categories";

class QuestionCategoryService {

    // Matches @PostMapping
    // Takes the QuestionCategoryRequestDTO payload for the request body
    create(questionCategoryRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            questionCategoryRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    // Returns an array of QuestionCategoryResponseDTO objects
    getAll() {
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    // Returns a specific QuestionCategoryResponseDTO object
    getById(id) {
        return apiClient.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, questionCategoryRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            questionCategoryRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
        deleteSection(id) {
        return apiClient.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }


    // Upload Excel
    uploadExcel(file) {

        const formData = new FormData();

        formData.append("file", file);

        return apiClient.post(
            `${BASE_URL}/upload`,
            formData,
            {
                headers:{
                    "Content-Type":"multipart/form-data"
                },
                withCredentials:true
            }
        );
    }
}

// Export an instantiated instance of the service architecture directly
export default new QuestionCategoryService();


