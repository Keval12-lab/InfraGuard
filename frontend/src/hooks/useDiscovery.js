import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { discoveryService } from "../services/discoveryService";

export function useSubnetDetection() {
  return useQuery({
    queryKey: ["discovery", "detect-subnet"],
    queryFn: discoveryService.detectSubnet,
    staleTime: 10000, // 10 seconds cache
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useNetworkQuality() {
  return useQuery({
    queryKey: ["discovery", "network-quality"],
    queryFn: discoveryService.getNetworkQuality,
    staleTime: 10000, // 10 seconds cache
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useStartDiscoveryScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subnet) => discoveryService.startScan(subnet),
    onSuccess: () => {
      // Invalidate relevant queries so dashboard, assets, and monitoring update immediately
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    },
  });
}
