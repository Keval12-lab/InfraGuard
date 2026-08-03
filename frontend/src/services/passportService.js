import apiClient from "./apiClient";

export async function fetchAssetPassport(deviceId) {
  const response = await apiClient.get(`/assets/${deviceId}/passport`);
  return response;
}

export async function updateAssetPassport({ deviceId, payload }) {
  const response = await apiClient.put(`/assets/${deviceId}/passport`, payload);
  return response.data;
}
