import apiClient from "./apiClient";

export async function fetchTopology() {
  const response = await apiClient.get("/api/v1/snmp/topology");
  return response;
}
