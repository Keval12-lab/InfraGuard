import apiClient from "./apiClient";

export const discoveryService = {
  detectSubnet: async () => {
    const res = await apiClient.get("/discovery/detect-subnet");
    return res.data;
  },
  startScan: async (subnet) => {
    const res = await apiClient.post("/discovery/scan", { subnet });
    return res.data;
  },
  getHistory: async () => {
    const res = await apiClient.get("/discovery/history");
    return res.data;
  },
  getNetworkQuality: async () => {
    const res = await apiClient.get("/discovery/network-quality");
    return res.data;
  },
};

export default discoveryService;
