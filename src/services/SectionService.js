import apiClient from "./apiClient";

const BASE_URL = "/api/section";

class SectionService {
    // Matches @PostMapping
    saveSection(sectionRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            sectionRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @GetMapping
    getAllSections() {
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true }
        );
    }

    // Matches @GetMapping("/{id}")
    getSectionById(id) {
        return apiClient.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    updateSection(id, sectionRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            sectionRequestDTO,
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

    // Upload Excel (.xls, .xlsx, .xlsm)
uploadExcel(file) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(
        `${BASE_URL}/upload`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        }
    );
}
}

export default new SectionService();

