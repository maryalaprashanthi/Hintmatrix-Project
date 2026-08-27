import apiClient from "./apiClient";

const BASE_URL = "/api/rule-engines";

const API_URL = "/api";
const RuleEngineService = {
  // Create Rule
  saveRule: async (ruleData) => {
    const response = await apiClient.post(BASE_URL, ruleData);
    return response.data;
  },

  // Get All Rules
  getAllRules: async () => {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  },

  // Get Rule By Id
  getRuleById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get Rule Engine by Attribute Id
  getRuleEngineByAttributeId: async (attributeId) => {
    const response = await apiClient.get(
      `${BASE_URL}/attribute/${attributeId}`,
    );

    return response.data;
  },

  // Update Rule
  updateRule: async (id, ruleData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, ruleData);
    return response.data;
  },

  // Delete Rule
  deleteRule: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
  // Dropdown APIs

  getChapters: async () => {
    const response = await apiClient.get(`${API_URL}/chapter`);
    return response.data;
  },

  getTableNames: async () => {
    const response = await apiClient.get(`${API_URL}/table-names`);
    return response.data;
  },

  getTableHeaders: async () => {
    const response = await apiClient.get(`${API_URL}/table-headers`);
    return response.data;
  },

  getTableAttributes: async () => {
    const response = await apiClient.get(`${API_URL}/table-attributes`);
    return response.data;
  },

  getAttributeAnswers: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/attribute/${id}`);
    return await response.data;
  },

  // Upload Rules Excel
  uploadRulesExcel: async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await apiClient.post(
      "/api/rule-engines/excel/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};

export default RuleEngineService;
