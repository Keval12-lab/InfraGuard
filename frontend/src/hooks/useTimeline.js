import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchTimeline, createTimelineEvent } from "../services/timelineService";

export function useTimeline(filters = {}) {
  return useQuery({
    queryKey: ["timeline", filters],
    queryFn: () => fetchTimeline(filters),
    staleTime: 10 * 1000,
  });
}

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTimelineEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["timeline"]);
    },
  });
}
