import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchAutomations,
  runAutomation,
  fetchAutomationRuns,
} from "../services/automationService";

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
    staleTime: 30 * 1000,
  });
}

export function useAutomationRuns() {
  return useQuery({
    queryKey: ["automationRuns"],
    queryFn: fetchAutomationRuns,
    staleTime: 5 * 1000,
    refetchInterval: 5000, // Poll progress while running
  });
}

export function useRunAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries(["automationRuns"]);
      queryClient.invalidateQueries(["timeline"]);
    },
  });
}
