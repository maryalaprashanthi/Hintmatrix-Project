import apiClient from "./apiClient";

const SubscriptionService = {
  getPlans(courseId) {
    return apiClient.get("/api/subscriptions/plans", {
      params: courseId ? { courseId } : undefined,
    });
  },

  getPlansForCourse(courseId) {
    return apiClient.get(`/api/subscriptions/courses/${courseId}/plans`);
  },

  createPlan(payload) {
    return apiClient.post("/api/subscriptions/plans", payload);
  },

  updatePlan(id, payload) {
    return apiClient.put(`/api/subscriptions/plans/${id}`, payload);
  },

  deletePlan(id) {
    return apiClient.delete(`/api/subscriptions/plans/${id}`);
  },

  activate(payload) {
    return apiClient.post("/api/subscriptions/activate", payload);
  },

  activateBulk(payload) {
    return apiClient.post("/api/subscriptions/bulk", payload);
  },

  getMine() {
    return apiClient.get("/api/subscriptions/mine");
  },

  getHistory() {
    return apiClient.get("/api/subscriptions/history");
  },

  deactivate(subscriptionId) {
    return apiClient.post(`/api/subscriptions/${subscriptionId}/deactivate`);
  },
};

export default SubscriptionService;
