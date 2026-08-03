import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "";
const getBaseUrl = () => {
  if (!rawApiUrl) return "/api/v1";
  const cleanUrl = rawApiUrl.replace(/\/$/, "");
  return cleanUrl.endsWith("/api/v1") ? cleanUrl : `${cleanUrl}/api/v1`;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s for scan execution
});

// Response interceptor for centralized error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    let message = "An unexpected error occurred. Please try again.";

    if (error.response) {
      if (error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          message = `Server returned error (${error.response.status}).`;
        }
      } else {
        message =
          error.response.data?.message ||
          `Server returned error (${error.response.status}).`;
      }
    } else if (error.request) {
      // Request made but no response received
      message =
        "Service is temporarily unreachable. Please verify your backend server is running.";
    } else {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
