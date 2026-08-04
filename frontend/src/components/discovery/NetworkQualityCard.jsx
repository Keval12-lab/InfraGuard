import React, { useState } from "react";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import SectionHeader from "../common/SectionHeader";

const QualityMetric = ({ label, value, unit, max, inverse = false }) => {
  // If value is null/undefined, treat it as empty
  const displayValue = value !== null && value !== undefined ? value : "--";
  
  // Calculate percentage for progress bar
  let progress = 0;
  if (typeof value === "number") {
    progress = Math.min((value / max) * 100, 100);
  }

  // Determine color based on threshold (higher is worse)
  let color = "success";
  if (typeof value === "number") {
    if (progress > 75) color = "error";
    else if (progress > 50) color = "warning";
    else if (progress > 25) color = "info";
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
          {displayValue} {value !== null && value !== undefined ? unit : ""}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={color}
        sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }} 
      />
    </Box>
  );
};

export default function NetworkQualityCard({ data, isLoading, onRefresh, isRefetching }) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [toastOpen, setToastOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      if (onRefresh) {
        await onRefresh();
        setToastMessage("Network Quality updated");
        setToastSeverity("success");
        setToastOpen(true);
      }
    } catch (err) {
      setToastMessage("Failed to refresh Network Quality");
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const getQualityColor = (rating) => {
    switch (rating) {
      case "Excellent": return "success";
      case "Good": return "info";
      case "Fair": return "warning";
      case "Poor": return "error";
      default: return "default";
    }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <SectionHeader
              title="Network Quality"
              description="Real-time latency and reliability metrics."
            />
            <Tooltip title="Refresh Quality">
              <IconButton
                onClick={handleRefresh}
                disabled={isLoading || isRefetching}
                size="small"
                color="primary"
                sx={{ bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
              >
                <RefreshIcon fontSize="small" sx={{ animation: isRefetching ? "spin 1s linear infinite" : "none" }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Last Updated */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Last Updated: {isLoading ? "..." : timeAgo(data?.timestamp)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="20%" height={20} />
                    </Box>
                    <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 3 }} />
                  </Box>
                ))}
              </>
            ) : (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Overall Rating
                  </Typography>
                  <Chip
                    label={data?.quality_rating || "Unknown"}
                    color={getQualityColor(data?.quality_rating)}
                    size="small"
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Box>
                
                <QualityMetric 
                  label="Gateway Ping" 
                  value={data?.gateway_ping_ms} 
                  unit="ms" 
                  max={50} 
                />
                <QualityMetric 
                  label="Internet Ping" 
                  value={data?.internet_ping_ms} 
                  unit="ms" 
                  max={100} 
                />
                <QualityMetric 
                  label="DNS Lookup" 
                  value={data?.dns_response_ms} 
                  unit="ms" 
                  max={50} 
                />
                <QualityMetric 
                  label="Packet Loss" 
                  value={data?.packet_loss_pct} 
                  unit="%" 
                  max={10} 
                />
                <QualityMetric 
                  label="Jitter" 
                  value={data?.jitter_ms} 
                  unit="ms" 
                  max={30} 
                />
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
