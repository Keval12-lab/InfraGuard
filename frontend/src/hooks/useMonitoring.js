import { useQuery } from "@tanstack/react-query";

import { monitoringService } from "../services/monitoringService";

export function useMonitoringSummary() {
  return useQuery({
    queryKey: ["monitoring", "summary"],
    queryFn: monitoringService.getSummary,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useMonitoringStatus() {
  return useQuery({
    queryKey: ["monitoring", "status"],
    queryFn: monitoringService.getStatus,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useDeviceMonitoringHistory(deviceId, limit = 50) {
  return useQuery({
    queryKey: ["monitoring", "history", deviceId, limit],
    queryFn: () => monitoringService.getDeviceHistory(deviceId, limit),
    enabled: Boolean(deviceId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
