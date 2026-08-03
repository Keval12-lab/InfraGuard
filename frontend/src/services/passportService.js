import apiClient from "./apiClient";

export async function fetchAssetPassport(deviceId) {
  const response = await apiClient.get(`/api/v1/assets/${deviceId}/passport`);
  return response;
}

export async function updateAssetPassport({ deviceId, payload }) {
  const response = await apiClient.put(`/api/v1/assets/${deviceId}/passport`, payload);
  return response.data;
}
