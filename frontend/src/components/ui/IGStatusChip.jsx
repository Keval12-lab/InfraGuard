import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

/**
 * Standardized Enterprise Status Chip
 * @param {string} status - Healthy, Warning, Offline, Info
 */
export default function IGStatusChip({ status }) {
  let color = "default";
  let icon = <InfoIcon />;
  const normalizedStatus = (status || "Unknown").toLowerCase();

  if (normalizedStatus.includes("health") || normalizedStatus === "online" || normalizedStatus === "active") {
    color = "success";
    icon = <CheckCircleIcon />;
  } else if (normalizedStatus.includes("warn") || normalizedStatus.includes("degraded")) {
    color = "warning";
    icon = <WarningIcon />;
  } else if (normalizedStatus.includes("off") || normalizedStatus.includes("down") || normalizedStatus.includes("error")) {
    color = "error";
    icon = <ErrorIcon />;
  } else {
    color = "info";
  }

  return (
    <Chip
      icon={icon}
      label={status}
      color={color}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 700,
        borderRadius: 1.5,
        "& .MuiChip-icon": {
          fontSize: 16,
        },
      }}
    />
  );
}
