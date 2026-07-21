import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/table-attributes")
const BASE_URL = "http://localhost:8080/api/table-attributes";

class TableAttributeService {

    // Matches @PostMapping
    // Takes the TableAttributeRequestDTO payload for the request body
    create(tableAttributeRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            tableAttributeRequestDTO,
            { withCredentials: true } // Allows backend session cookies/CORS handshakes
        );
    }

    // Matches @GetMapping
    // Returns a array of TableAttributeResponseDTO objects
    getAll() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes tracking authorization tokens/cookies
        );
    }

    // Matches @GetMapping("/{id}")
    // Returns a specific TableAttributeResponseDTO object
    getById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    update(id, tableAttributeRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            tableAttributeRequestDTO,
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
export default new TableAttributeService();
