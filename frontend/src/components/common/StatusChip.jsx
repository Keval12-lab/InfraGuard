import React from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import SyncIcon from "@mui/icons-material/Sync";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Chip from "@mui/material/Chip";

export default function StatusChip({ status, label, size = "small" }) {
  const normalized = (status || "HEALTHY").toString().toUpperCase();
  let color = "default";
  let IconComp = InfoIcon;

  if (
    normalized === "HEALTHY" ||
    normalized === "ONLINE" ||
    normalized === "SUCCESS" ||
    normalized === "REACHABLE" ||
    normalized === "COMPLETED"
  ) {
    color = "success";
    IconComp = CheckCircleIcon;
  } else if (
    normalized === "WARNING" ||
    normalized === "PENDING" ||
    normalized === "FAIR"
  ) {
    color = "warning";
    IconComp = WarningAmberIcon;
  } else if (
    normalized === "OFFLINE" ||
    normalized === "UNREACHABLE" ||
    normalized === "FAILED" ||
    normalized === "ERROR" ||
    normalized === "CRITICAL" ||
    normalized === "POOR"
  ) {
    color = "error";
    IconComp = CancelIcon;
  } else if (
    normalized === "SCANNING" ||
    normalized === "RUNNING" ||
    normalized === "IN_PROGRESS"
  ) {
    color = "primary";
    IconComp = SyncIcon;
  }

  return (
    <Chip
      size={size}
      color={color}
      variant="outlined"
      icon={<IconComp style={{ fontSize: size === "small" ? 14 : 16 }} />}
      label={label || status}
      sx={{
        fontWeight: 600,
        fontSize: size === "small" ? "0.75rem" : "0.825rem",
        borderRadius: "6px",
        height: size === "small" ? 24 : 28,
        "& .MuiChip-icon": {
          ml: 0.8,
        },
      }}
    />
  );
}
