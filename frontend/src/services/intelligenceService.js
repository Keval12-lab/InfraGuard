import apiClient from "./apiClient";

export const intelligenceService = {
  getSummary: async () => {
    const res = await apiClient.get("/intelligence/summary");
    return res.data;
  },
};

export default intelligenceService;
