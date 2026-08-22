import apiClient from "./apiClient";

const BASE_URL = "/api/auth";

class LoginService {

    login(loginData) {
        return apiClient.post(
            `${BASE_URL}/login`,
            loginData
        );
    }

}

export default new LoginService();
