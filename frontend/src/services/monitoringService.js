import apiClient from "./apiClient";

export const monitoringService = {
  getStatus: async () => {
    const res = await apiClient.get("/monitoring/status");
    return res.data;
  },
  getSummary: async () => {
    const res = await apiClient.get("/monitoring/summary");
    return res.data;
  },
  getDeviceHistory: async (deviceId, limit = 50) => {
    const res = await apiClient.get(`/monitoring/history/${deviceId}`, {
      params: { limit },
    });
    return res.data;
  },
};

export default monitoringService;
