import apiClient from "./apiClient";

// Updated root URL mapping to match the Controller's @RequestMapping("/api/branch")
const BASE_URL = "/api/branch";

class BranchService {

    // Matches @PostMapping
    saveBranch(branchRequestDTO) {
        return apiClient.post(
            `${BASE_URL}`,
            branchRequestDTO,
            { withCredentials: true } // Allows backend session cookies
        );
    }

    // Matches @GetMapping
    getAllBranches() {
        return apiClient.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes authorization cookie
        );
    }

    // Matches @GetMapping("/{id}")
    getBranchById(id) {
        return apiClient.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    updateBranch(id, branchRequestDTO) {
        return apiClient.put(
            `${BASE_URL}/${id}`,
            branchRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    deleteBranch(id) {
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

export default new BranchService();

