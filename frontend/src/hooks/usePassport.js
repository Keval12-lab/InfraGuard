import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchAssetPassport, updateAssetPassport } from "../services/passportService";

export function useAssetPassport(deviceId) {
  return useQuery({
    queryKey: ["assetPassport", deviceId],
    queryFn: () => fetchAssetPassport(deviceId),
    enabled: Boolean(deviceId),
    staleTime: 10 * 1000,
  });
}

export function useUpdateAssetPassport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAssetPassport,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["assetPassport", variables.deviceId]);
      queryClient.invalidateQueries(["assets"]);
    },
  });
}
