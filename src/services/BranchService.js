import axios from "axios";

// Updated root URL mapping to match the Controller's @RequestMapping("/api/branch")
const BASE_URL = "http://localhost:8080/api/branch";

class BranchService {

    // Matches @PostMapping
    saveBranch(branchRequestDTO) {
        return axios.post(
            `${BASE_URL}`,
            branchRequestDTO,
            { withCredentials: true } // Allows backend session cookies
        );
    }

    // Matches @GetMapping
    getAllBranches() {
        return axios.get(
            `${BASE_URL}`,
            { withCredentials: true } // Passes authorization cookie
        );
    }

    // Matches @GetMapping("/{id}")
    getBranchById(id) {
        return axios.get(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }

    // Matches @PutMapping("/{id}")
    // Takes id for the URL path variable and the DTO payload for the request body
    updateBranch(id, branchRequestDTO) {
        return axios.put(
            `${BASE_URL}/${id}`,
            branchRequestDTO,
            { withCredentials: true }
        );
    }

    // Matches @DeleteMapping("/{id}")
    deleteBranch(id) {
        return axios.delete(
            `${BASE_URL}/${id}`,
            { withCredentials: true }
        );
    }
}

export default new BranchService();
