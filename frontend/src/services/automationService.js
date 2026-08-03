import apiClient from "./apiClient";

export async function fetchAutomations() {
  const response = await apiClient.get("/automations");
  return response;
}

export async function runAutomation(autoId) {
  const response = await apiClient.post(`/automations/${autoId}/run`);
  return response;
}

export async function fetchAutomationRuns() {
  const response = await apiClient.get("/automations/runs");
  return response;
}
