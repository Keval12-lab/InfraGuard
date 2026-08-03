import apiClient from "./apiClient";

export async function fetchTimeline({
  device_id,
  event_type,
  severity,
  limit = 100,
  offset = 0,
} = {}) {
  const response = await apiClient.get("/timeline", {
    params: { device_id, event_type, severity, limit, offset },
  });
  return response;
}

export async function createTimelineEvent(eventPayload) {
  const response = await apiClient.post("/timeline/event", eventPayload);
  return response;
}
