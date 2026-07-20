import axios from "axios";

const BASE_URL = "http://localhost:8080/api/section";

class SectionService {
    // Matches @PostMapping
    saveSection(sectionRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            sectionRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @GetMapping
    getAllSections() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true }
        );
    }

    // Matches @GetMapping("/{id}")
    getSectionById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    updateSection(id, sectionRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            sectionRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    deleteSection(id) {
        return axios.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

export default new SectionService();
