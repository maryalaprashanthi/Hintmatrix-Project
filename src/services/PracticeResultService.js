import apiClient from "./apiClient";

const PracticeResultService = {
  recordFromEvent: (result) =>
    apiClient.post("/api/practice/results/from-event", result),
};

export default PracticeResultService;
