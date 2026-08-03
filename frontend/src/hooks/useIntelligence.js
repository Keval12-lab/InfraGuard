import { useQuery } from "@tanstack/react-query";

import { intelligenceService } from "../services/intelligenceService";

export function useIntelligence() {
  return useQuery({
    queryKey: ["intelligence", "summary"],
    queryFn: intelligenceService.getSummary,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export default useIntelligence;
