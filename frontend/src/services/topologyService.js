import apiClient from "./apiClient";

export async function fetchTopology() {
  const response = await apiClient.get("/snmp/topology");
  return response;
}
