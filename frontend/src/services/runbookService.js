import apiClient from "./apiClient";

export async function fetchRunbooks() {
  const response = await apiClient.get("/runbooks");
  return response;
}

export async function startRunbookExecution({ runbook_id, device_id }) {
  const response = await apiClient.post("/runbooks/execute", {
    runbook_id,
    device_id,
  });
  return response;
}

export async function advanceRunbookStep({ execId, choice_index, notes }) {
  const response = await apiClient.post(`/runbooks/execute/${execId}/step`, {
    choice_index,
    notes,
  });
  return response;
}

export async function fetchRunbookHistory() {
  const response = await apiClient.get("/runbooks/history");
  return response;
}
