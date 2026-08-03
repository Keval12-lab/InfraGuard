import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  discoverSnmp,
  fetchSnmpDevice,
  fetchSnmpInterfaces,
  fetchSnmpNeighbors,
  fetchSnmpVlans,
} from "../services/snmpService";

export function useSnmpDevice(deviceId) {
  return useQuery({
    queryKey: ["snmpDevice", deviceId],
    queryFn: () => fetchSnmpDevice(deviceId),
    enabled: Boolean(deviceId),
    retry: false, // Prevent infinite retries if not scanned yet
  });
}

export function useSnmpInterfaces(deviceId) {
  return useQuery({
    queryKey: ["snmpInterfaces", deviceId],
    queryFn: () => fetchSnmpInterfaces(deviceId),
    enabled: Boolean(deviceId),
  });
}

export function useSnmpNeighbors(deviceId) {
  return useQuery({
    queryKey: ["snmpNeighbors", deviceId],
    queryFn: () => fetchSnmpNeighbors(deviceId),
    enabled: Boolean(deviceId),
  });
}

export function useSnmpVlans(deviceId) {
  return useQuery({
    queryKey: ["snmpVlans", deviceId],
    queryFn: () => fetchSnmpVlans(deviceId),
    enabled: Boolean(deviceId),
  });
}

export function useDiscoverSnmp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: discoverSnmp,
    onSuccess: (data, deviceId) => {
      queryClient.invalidateQueries(["snmpDevice", deviceId]);
      queryClient.invalidateQueries(["snmpInterfaces", deviceId]);
      queryClient.invalidateQueries(["snmpNeighbors", deviceId]);
      queryClient.invalidateQueries(["snmpVlans", deviceId]);
      queryClient.invalidateQueries(["timeline"]);
    },
  });
}
