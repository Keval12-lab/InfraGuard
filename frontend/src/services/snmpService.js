import apiClient from "./apiClient";

export async function discoverSnmp(deviceId) {
  const response = await apiClient.post("/api/v1/snmp/discover", { device_id: deviceId });
  return response.data;
}

export async function fetchSnmpDevice(deviceId) {
  const response = await apiClient.get(`/api/v1/snmp/device/${deviceId}`);
  return response;
}

export async function fetchSnmpInterfaces(deviceId) {
  const response = await apiClient.get(`/api/v1/snmp/interfaces/${deviceId}`);
  return response;
}

export async function fetchSnmpNeighbors(deviceId) {
  const response = await apiClient.get(`/api/v1/snmp/neighbors/${deviceId}`);
  return response;
}

export async function fetchSnmpVlans(deviceId) {
  const response = await apiClient.get(`/api/v1/snmp/vlans/${deviceId}`);
  return response;
}
