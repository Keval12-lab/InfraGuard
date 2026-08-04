import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

import SearchIcon from "@mui/icons-material/Search";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

/**
 * Standardized Enterprise Status Chip
 * @param {string} status - Healthy, Warning, Offline, Info, Scanning, Maintenance, Initializing, Unknown
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
  } else if (normalizedStatus.includes("off") || normalizedStatus.includes("down") || normalizedStatus.includes("error") || normalizedStatus.includes("fail")) {
    color = "error";
    icon = <ErrorIcon />;
  } else if (normalizedStatus.includes("scan")) {
    color = "info";
    icon = <SearchIcon />;
  } else if (normalizedStatus.includes("maintain") || normalizedStatus.includes("maintenance")) {
    color = "warning";
    icon = <BuildCircleIcon />;
  } else if (normalizedStatus.includes("init") || normalizedStatus.includes("start")) {
    color = "info";
    icon = <AutorenewIcon sx={{ animation: "spin 2s linear infinite", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />;
  } else if (normalizedStatus.includes("unknown") || normalizedStatus.includes("pending")) {
    color = "default";
    icon = <HelpOutlineIcon />;
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
