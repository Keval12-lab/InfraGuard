import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchRunbooks,
  startRunbookExecution,
  advanceRunbookStep,
  fetchRunbookHistory,
} from "../services/runbookService";

export function useRunbooks() {
  return useQuery({
    queryKey: ["runbooks"],
    queryFn: fetchRunbooks,
    staleTime: 30 * 1000,
  });
}

export function useRunbookHistory() {
  return useQuery({
    queryKey: ["runbookHistory"],
    queryFn: fetchRunbookHistory,
    staleTime: 10 * 1000,
  });
}

export function useStartRunbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startRunbookExecution,
    onSuccess: () => {
      queryClient.invalidateQueries(["runbookHistory"]);
    },
  });
}

export function useAdvanceRunbookStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advanceRunbookStep,
    onSuccess: () => {
      queryClient.invalidateQueries(["runbookHistory"]);
      queryClient.invalidateQueries(["timeline"]);
    },
  });
}
