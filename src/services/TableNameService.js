import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/table-names")
const BASE_URL = "http://localhost:8080/api/table-names";

class TableNameService {

    // Matches @PostMapping
    // Takes the TableNameRequestDTO payload profile for the request body
    create(tableNameRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            tableNameRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    getAll() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    getById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, tableNameRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            tableNameRequestDTO,
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
export default new TableNameService();
