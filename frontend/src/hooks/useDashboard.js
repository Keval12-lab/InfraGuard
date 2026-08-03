import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../services/dashboardService";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getSummary,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 60 seconds auto-refresh
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export default useDashboard;
