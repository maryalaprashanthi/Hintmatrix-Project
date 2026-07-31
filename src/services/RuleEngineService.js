import axios from "axios";

const BASE_URL = "http://localhost:8080/api/rule-engines";

const RuleEngineService = {
  // Create Rule
  saveRule: async (ruleData) => {
    const response = await axios.post(BASE_URL, ruleData);
    return response.data;
  },

  // Get All Rules
  getAllRules: async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
  },

  // Get Rule By Id
  getRuleById: async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Update Rule
  updateRule: async (id, ruleData) => {
    const response = await axios.put(`${BASE_URL}/${id}`, ruleData);
    return response.data;
  },

  // Delete Rule
  deleteRule: async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

export default RuleEngineService;
