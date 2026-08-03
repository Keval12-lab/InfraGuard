import apiClient from "./apiClient";

export async function executePing({ ip, count = 4, asset_id }) {
  const response = await apiClient.post("/workspace/tools/ping", {
    ip,
    count,
    asset_id,
  });
  return response;
}

export async function executePortCheck({ ip, port, asset_id }) {
  const response = await apiClient.post("/workspace/tools/port-check", {
    ip,
    port,
    asset_id,
  });
  return response;
}

export async function executeDnsLookup({ query, asset_id }) {
  const response = await apiClient.post("/workspace/tools/dns-lookup", {
    query,
    asset_id,
  });
  return response;
}

export async function executeWakeOnLan({ mac, asset_id }) {
  const response = await apiClient.post("/workspace/tools/wol", { mac, asset_id });
  return response;
}

export async function fetchWorkspaceHistory(asset_id) {
  const response = await apiClient.get("/workspace/history", {
    params: { asset_id },
  });
  return response;
}
