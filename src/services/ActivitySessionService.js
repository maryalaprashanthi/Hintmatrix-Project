import apiClient from "./apiClient";

const BASE_URL = "/api/activity-sessions";

const payload = (sessionKey, context) => ({ sessionKey, ...context });

const ActivitySessionService = {
  start: () => apiClient.post(BASE_URL),
  heartbeat: (sessionKey, context = {}) =>
    apiClient.post(`${BASE_URL}/heartbeat`, payload(sessionKey, context)),
  idle: (sessionKey) => apiClient.post(`${BASE_URL}/idle`, payload(sessionKey)),
  resume: (sessionKey) =>
    apiClient.post(`${BASE_URL}/resume`, payload(sessionKey)),
  close: (sessionKey) =>
    apiClient.post(`${BASE_URL}/close`, payload(sessionKey)),
  getTotalTime: (filters = {}) =>
    apiClient.get(`${BASE_URL}/total-time`, { params: filters }),
  getDailyTime: (days = 7, filters = {}) =>
    apiClient.get(`${BASE_URL}/daily-time`, { params: { ...filters, days } }),
  getStudentEngagementTrends: (days = 7, filters = {}) =>
    apiClient.get(`${BASE_URL}/student-engagement-trends`, {
      params: { ...filters, days },
    }),
  getLoginInactivity: (days = 7, filters = {}) =>
    apiClient.get("/api/analytics/student-logins/inactive", {
      params: { ...filters, days },
    }),
  getWeeklyStudyGoal: () => apiClient.get("/api/study-goals/weekly"),
  saveWeeklyStudyGoal: (weeklyGoalHours) =>
    apiClient.put("/api/study-goals/weekly", { weeklyGoalHours }),
  getContentDailyTime: (days = 7, level = "CHAPTER", filters = {}) =>
    apiClient.get(`${BASE_URL}/content-daily-time`, {
      params: { ...filters, days, level },
    }),
  getPeriodComparison: (days = 7, filters = {}) =>
    apiClient.get(`${BASE_URL}/period-comparison`, {
      params: { ...filters, days },
    }),
};

export default ActivitySessionService;
