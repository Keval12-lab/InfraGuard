import { useQuery } from "@tanstack/react-query";

import { assetService } from "../services/assetService";

export function useAssets(filters = {}) {
  const { search, status, vendor, device_type } = filters;

  return useQuery({
    queryKey: ["assets", { search, status, vendor, device_type }],
    queryFn: () => assetService.getAssets({ search, status, vendor, device_type }),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export default useAssets;
