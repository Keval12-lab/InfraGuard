import apiClient from "./apiClient";

export const dashboardService = {
  getSummary: async () => {
    const res = await apiClient.get("/dashboard");
    return res.data;
  },
};

export default dashboardService;
