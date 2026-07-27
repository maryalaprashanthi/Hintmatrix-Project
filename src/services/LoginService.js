import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

class LoginService {

    login(loginData) {
        return axios.post(
            `${BASE_URL}/login`,
            loginData
        );
    }

}

export default new LoginService();