import apiClient from "./apiClient";

// Matches the Spring Boot Controller's @RequestMapping("/api/topics")
// (formerly "/api/question-categories" - the "Question Category" level was
// renamed to "Topic" in the Course -> Subject -> Chapter -> Topic -> Question
// hierarchy).
//
// Request body:  { courseId, subjectId, chapterId, name, activeRow }
// Response body: { topicId, name, courseId, courseName, subjectId, subjectName,
//                  chapterId, chapterName, activeRow, ... }
const BASE_URL = "/api/topics";

class TopicService {

    // Matches @PostMapping
    // Takes the TopicRequestDTO payload for the request body
    create(topicRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            topicRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    // Returns an array of TopicResponseDTO objects
    getAll() {
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    // Returns a specific TopicResponseDTO object
    getById(id) {
        return apiClient.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, topicRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            topicRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    delete(id) {
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
export default new TopicService();
