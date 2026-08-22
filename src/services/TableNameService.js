import apiClient from "./apiClient";

// Matches the Spring Boot Controller's @RequestMapping("/api/table-names")
const BASE_URL = "/api/table-names";

class TableNameService {

    // Matches @PostMapping
    // Takes the TableNameRequestDTO payload profile for the request body
    create(tableNameRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            tableNameRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    getAll() { 
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
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
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, tableNameRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            tableNameRequestDTO,
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

    uploadExcel(file) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(
        `${BASE_URL}/upload`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        }
    );
}
}

// Export an instantiated instance of the service architecture directly
export default new TableNameService();

