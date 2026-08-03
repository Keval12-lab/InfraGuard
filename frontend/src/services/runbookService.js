import apiClient from "./apiClient";

export async function fetchRunbooks() {
  const response = await apiClient.get("/api/v1/runbooks");
  return response;
}

export async function startRunbookExecution({ runbook_id, device_id }) {
  const response = await apiClient.post("/api/v1/runbooks/execute", {
    runbook_id,
    device_id,
  });
  return response;
}

export async function advanceRunbookStep({ execId, choice_index, notes }) {
  const response = await apiClient.post(`/api/v1/runbooks/execute/${execId}/step`, {
    choice_index,
    notes,
  });
  return response;
}

export async function fetchRunbookHistory() {
  const response = await apiClient.get("/api/v1/runbooks/history");
  return response;
}
