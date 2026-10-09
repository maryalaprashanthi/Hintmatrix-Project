import axios from "axios";

import { BACKEND_BASE_URL, backendUrl } from "../config/backend";
import { clearPageLoadCache } from "../utils/pageLoadCache";

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

export const clearAuthSession = () => {
  clearPageLoadCache();
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  sessionStorage.removeItem("token");
  localStorage.removeItem("activitySessionKey");
  localStorage.removeItem("lastUserActivityAt");
};

export const logoutUser = (navigateFn) => {
  const token = localStorage.getItem("token");
  const sessionKey = localStorage.getItem("activitySessionKey");

  if (token && sessionKey) {
    fetch(backendUrl("/api/activity-sessions/close"), {
      method: "POST",
      keepalive: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionKey }),
    }).catch(() => {
      // Logout must still succeed if the tracking endpoint is unavailable.
    });
  }

  clearAuthSession();

  if (navigateFn) {
    navigateFn("/login", { replace: true });
    return;
  }

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios automatically set Content-Type for FormData.
    // This is required for multipart/form-data uploads.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const isAuthRequest = error.config?.url?.includes("/api/auth/");
    const isActivitySessionRequest = error.config?.url?.includes(
      "/api/activity-sessions",
    );

    if (statusCode === 401 && !isAuthRequest && !isActivitySessionRequest) {
      clearAuthSession();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
