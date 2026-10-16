import apiClient from "./apiClient";

export default {
  getMine: () => apiClient.get("/api/settings/mine"),
  saveMine: (settings) => apiClient.put("/api/settings/mine", settings),
};
