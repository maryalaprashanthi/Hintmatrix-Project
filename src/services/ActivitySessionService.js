import apiClient from "./apiClient";

const BASE_URL = "/api/activity-sessions";

const payload = (sessionKey) => ({ sessionKey });

const ActivitySessionService = {
  start: () => apiClient.post(BASE_URL),
  heartbeat: (sessionKey) =>
    apiClient.post(`${BASE_URL}/heartbeat`, payload(sessionKey)),
  idle: (sessionKey) => apiClient.post(`${BASE_URL}/idle`, payload(sessionKey)),
  resume: (sessionKey) =>
    apiClient.post(`${BASE_URL}/resume`, payload(sessionKey)),
  close: (sessionKey) =>
    apiClient.post(`${BASE_URL}/close`, payload(sessionKey)),
  getTotalTime: () => apiClient.get(`${BASE_URL}/total-time`),
  getDailyTime: (days = 7, filters = {}) =>
    apiClient.get(`${BASE_URL}/daily-time`, { params: { ...filters, days } }),
};

export default ActivitySessionService;
