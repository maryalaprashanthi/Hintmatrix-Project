import apiClient from "./apiClient";

// Matches the Spring Boot Controller's @RequestMapping("/api/subjects")
// Subject is the level between Course and Chapter in the
// Course -> Subject -> Chapter -> Topic -> Question hierarchy.
//
// Request body:  { courseId, subjectName, activeRow }
// Response body: { subjectId, subjectName, courseId, courseName, activeRow, ... }
const BASE_URL = "/api/subjects";

class SubjectService {

    // Matches @PostMapping -> SubjectResponseDTO
    create(subjectRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            subjectRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @GetMapping -> List<SubjectResponseDTO>
    getAll() {
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true }
        );
    }

    // Matches @GetMapping("/{id}")
    getById(id) {
        return apiClient.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    update(id, subjectRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            subjectRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}") -> 204 No Content
    delete(id) {
        return apiClient.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

export default new SubjectService();
