import apiClient from "./apiClient";

const BASE_URL = "/api/auth";

class LoginService {

    getCurrentUser(options = {}) {
        return apiClient.get(`${BASE_URL}/me`, options);
    }

    login(loginData) {
        return apiClient.post(
            `${BASE_URL}/login`,
            loginData
        );
    }

}

export default new LoginService();
