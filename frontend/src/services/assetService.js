import apiClient from "./apiClient";

export const assetService = {
  getAssets: async ({ search, status, vendor, device_type }) => {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== "ALL") params.status = status;
    if (vendor && vendor !== "ALL") params.vendor = vendor;
    if (device_type && device_type !== "ALL") params.device_type = device_type;

    const res = await apiClient.get("/assets", { params });
    return res.data;
  },
  getAssetById: async (id) => {
    const res = await apiClient.get(`/assets/${id}`);
    return res.data;
  },
};

export default assetService;
