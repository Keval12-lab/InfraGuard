import apiClient from "./apiClient";

export async function fetchAutomations() {
  const response = await apiClient.get("/api/v1/automations");
  return response;
}

export async function runAutomation(autoId) {
  const response = await apiClient.post(`/api/v1/automations/${autoId}/run`);
  return response;
}

export async function fetchAutomationRuns() {
  const response = await apiClient.get("/api/v1/automations/runs");
  return response;
}
