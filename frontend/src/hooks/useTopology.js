import { useQuery } from "@tanstack/react-query";

import { fetchTopology } from "../services/topologyService";

export function useTopology() {
  return useQuery({
    queryKey: ["topology"],
    queryFn: fetchTopology,
    staleTime: 10 * 1000,
    refetchInterval: 15000, // Update dynamically for live statuses
  });
}
