import axios from "axios";

const BASE_URL = "http://localhost:8080";

class BranchService {

    saveBranch(branch){
        return axios.post(
            `${BASE_URL}/saveBranch`,
            branch,
            { withCredentials: true } // ◄— Allows backend session cookies
        );
    }

    getAllBranches(){
        return axios.get(
            `${BASE_URL}/getAllBranches`,
            { withCredentials: true } // ◄— Passes authorization cookie
        );
    }

    getBranchById(id){
        return axios.get(
            `${BASE_URL}/getBranchById/${id}`,
            { withCredentials: true }
        );
    }

    updateBranch(branch){
        return axios.put(
            `${BASE_URL}/updateBranch`,
            branch,
            { withCredentials: true }
        );
    }

    deleteBranch(id){
        return axios.delete(
            `${BASE_URL}/deleteBranch/${id}`,
            { withCredentials: true }
        );
    }
}

export default new BranchService();
