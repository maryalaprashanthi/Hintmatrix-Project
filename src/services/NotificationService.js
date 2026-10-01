import apiClient from "./apiClient";

const BASE_URL = "/api/notifications";

const NotificationService = {
  getMine: (limit = 20) => apiClient.get(`${BASE_URL}/mine`, { params: { limit } }),
  getUnreadCount: () => apiClient.get(`${BASE_URL}/mine/unread-count`),
  markRead: (notificationId) => apiClient.put(`${BASE_URL}/${notificationId}/read`),
  markAllRead: () => apiClient.put(`${BASE_URL}/mine/read-all`),
};

export default NotificationService;
