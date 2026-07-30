import { useEffect, useState } from "react";
import axios from "axios";
import Alert from "@mui/material/Alert";
import EmptyPage from "./EmptyPage";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export default function DashboardPage() {
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/health`)
      .then((response) => setBackendStatus(response.data?.status === "ok" ? "connected" : "offline"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const isConnected = backendStatus === "connected";
  const statusText = backendStatus === "checking"
    ? "Checking Backend..."
    : isConnected
      ? "Backend Connected"
      : "Backend Offline";

  return (
    <EmptyPage title="Dashboard" description="Application shell placeholder for future visibility widgets.">
      <Alert severity={isConnected ? "success" : backendStatus === "checking" ? "info" : "error"}>
        {statusText}
      </Alert>
    </EmptyPage>
  );
}