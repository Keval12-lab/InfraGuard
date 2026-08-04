import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BuildIcon from "@mui/icons-material/Build";
import IGCard from "./IGCard";

export default function IGRecommendationCard({
  issueTitle = "HP LaserJet Printer Offline",
  possibleReason = "Power cable disconnected or IP address changed",
  verifications = [
    { label: "Ping Probe", verified: true },
    { label: "MAC ARP", verified: true },
    { label: "SNMP MIB", verified: false },
  ],
  steps = [
    "Verify power cable and front panel LED light",
    "Check Ethernet patch cord connected to switch port #4",
    "Run subnet scan to confirm IP address assignment",
  ],
  confidence = 80,
  onActionClick,
}) {
  return (
    <IGCard
      title="Troubleshooting Recommendation"
      variant="warning"
      action={
        <Chip
          label={`${confidence}% Confidence`}
          color={confidence >= 80 ? "success" : "warning"}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      }
    >
      <Stack spacing={2}>
        {/* Issue & Cause */}
        <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "rgba(245, 158, 11, 0.08)", borderLeft: "4px solid", borderColor: "warning.main" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "warning.main", mb: 0.5 }}>
            {issueTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Possible Reason:</strong> {possibleReason}
          </Typography>
        </Box>

        {/* Verification Checkmarks */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", display: "block", mb: 1 }}>
            Telemetry Verification Checklist
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
            {verifications.map((item, idx) => (
              <Chip
                key={idx}
                icon={item.verified ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                label={item.label}
                color={item.verified ? "success" : "default"}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Action Steps */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", display: "block", mb: 1 }}>
            What You Can Try Next
          </Typography>
          <Stack spacing={1}>
            {steps.map((step, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, minWidth: 20 }}>
                  {idx + 1}.
                </Typography>
                <Typography variant="body2">{step}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Action Button */}
        {onActionClick && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<BuildIcon />}
            onClick={onActionClick}
            sx={{ borderRadius: 2.5, fontWeight: 700, mt: 1 }}
          >
            Re-run Diagnostic Scan
          </Button>
        )}
      </Stack>
    </IGCard>
  );
}
