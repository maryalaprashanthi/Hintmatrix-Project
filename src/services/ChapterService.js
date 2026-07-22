import axios from "axios";

// Matches the Spring Boot Controller's @RequestMapping("/api/chapter")
const BASE_URL = "http://localhost:8080/api/chapter";

class ChapterService {

    // Matches @PostMapping
    // Takes the ChapterRequestDTO payload profile for the request body
    create(chapterRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            chapterRequestDTO,
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
    update(id, chapterRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            chapterRequestDTO,
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
export default new ChapterService();
