import axios from "axios";

const BASE_URL = "http://localhost:8080";

class CollegeService {

    saveCollege(college){
        return axios.post(
            `${BASE_URL}/saveCollege`,
            college,
            { withCredentials: true } // ◄— Passes your active login cookie
        );
    }

    getAllColleges(){
        return axios.get(
            `${BASE_URL}/getAllColleges`,
            { withCredentials: true } // ◄— Passes your active login cookie
        );
    }

    getCollegeById(id){
        return axios.get(
            `${BASE_URL}/getCollegeById/${id}`,
            { withCredentials: true }
        );
    }

    updateCollege(college){
        return axios.put(
            `${BASE_URL}/updateCollege`,
            college,
            { withCredentials: true }
        );
    }

    deleteCollege(id){
        return axios.delete(
            `${BASE_URL}/deleteCollege/${id}`,
            { withCredentials: true }
        );
    }
}

export default new CollegeService();