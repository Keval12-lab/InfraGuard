import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";

export default function IGHealthBadge({ status = "Healthy", labelOverride, size = "small" }) {
  const normalized = (status || "").toLowerCase();

  let color = "success";
  let icon = <CheckCircleIcon fontSize="small" />;
  let text = "Everything OK";

  if (normalized.includes("warning") || normalized.includes("attention")) {
    color = "warning";
    icon = <WarningAmberIcon fontSize="small" />;
    text = "Needs Attention";
  } else if (normalized.includes("offline") || normalized.includes("action") || normalized.includes("critical")) {
    color = "error";
    icon = <ErrorIcon fontSize="small" />;
    text = "Action Required";
  }

  return (
    <Chip
      icon={icon}
      label={labelOverride || text}
      color={color}
      size={size}
      variant="filled"
      sx={{ fontWeight: 700, borderRadius: 2 }}
    />
  );
}
