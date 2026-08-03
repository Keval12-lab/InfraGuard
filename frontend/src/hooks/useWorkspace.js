import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  executePing,
  executePortCheck,
  executeDnsLookup,
  executeWakeOnLan,
  fetchWorkspaceHistory,
} from "../services/workspaceService";

export function useWorkspaceHistory(assetId) {
  return useQuery({
    queryKey: ["workspaceHistory", assetId],
    queryFn: () => fetchWorkspaceHistory(assetId),
    staleTime: 10 * 1000,
  });
}

export function useExecuteTool() {
  const queryClient = useQueryClient();

  const pingMutation = useMutation({
    mutationFn: executePing,
    onSuccess: () => queryClient.invalidateQueries(["workspaceHistory"]),
  });

  const portCheckMutation = useMutation({
    mutationFn: executePortCheck,
    onSuccess: () => queryClient.invalidateQueries(["workspaceHistory"]),
  });

  const dnsLookupMutation = useMutation({
    mutationFn: executeDnsLookup,
    onSuccess: () => queryClient.invalidateQueries(["workspaceHistory"]),
  });

  const wolMutation = useMutation({
    mutationFn: executeWakeOnLan,
    onSuccess: () => queryClient.invalidateQueries(["workspaceHistory"]),
  });

  return {
    runPing: pingMutation.mutateAsync,
    isPingLoading: pingMutation.isPending,
    runPortCheck: portCheckMutation.mutateAsync,
    isPortCheckLoading: portCheckMutation.isPending,
    runDnsLookup: dnsLookupMutation.mutateAsync,
    isDnsLoading: dnsLookupMutation.isPending,
    runWol: wolMutation.mutateAsync,
    isWolLoading: wolMutation.isPending,
  };
}
