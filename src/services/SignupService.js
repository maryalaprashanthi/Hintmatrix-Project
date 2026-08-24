import apiClient from "./apiClient";

const BASE_URL = "/api/users/guest";
const GOOGLE_REGISTER_URL = "http://localhost:8080/api/auth/google";

class SignupService {
  register(signupData) {
    return apiClient.post(`${BASE_URL}/register`, signupData);
  }

  registerWithGoogle(credential) {
    return apiClient.post(GOOGLE_REGISTER_URL, { credential });
  }
}

export default new SignupService();
