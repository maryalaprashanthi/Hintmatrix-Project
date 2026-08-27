import apiClient from "./apiClient";

// Matches the Spring Boot Controller's @RequestMapping("/api/table-attributes")
const BASE_URL = "/api/table-attributes";

class TableAttributeService {
  // Matches @PostMapping
  // Takes the TableAttributeRequestDTO payload for the request body
  create(tableAttributeRequestDTO) {
    return apiClient.post(
      `${BASE_URL}`,
      tableAttributeRequestDTO,
      { withCredentials: true }, // Allows backend session cookies/CORS handshakes
    );
  }

  // Matches @GetMapping
  // Returns a array of TableAttributeResponseDTO objects
  getAll() {
    return apiClient.get(
      `${BASE_URL}`,
      { withCredentials: true }, // Passes tracking authorization tokens/cookies
    );
  }

  getRuleAttributes() {
    return apiClient.get(`${BASE_URL}/rule`, { withCredentials: true });
  }

  // Matches @GetMapping("/{id}")
  // Returns a specific TableAttributeResponseDTO object
  getById(id) {
    return apiClient.get(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  // Matches @PutMapping("/{id}")
  // Takes id for the URL path variable and the DTO payload for the request body
  update(id, tableAttributeRequestDTO) {
    return apiClient.put(`${BASE_URL}/${id}`, tableAttributeRequestDTO, {
      withCredentials: true,
    });
  }

  // Matches @DeleteMapping("/{id}")
  delete(id) {
    return apiClient.delete(`${BASE_URL}/${id}`, { withCredentials: true });
  }

  uploadExcel(file) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/api/table-attributes/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
  }
}

// Export an instantiated instance of the service architecture directly
export default new TableAttributeService();
