import React, { useState } from "react";

import DevicesIcon from "@mui/icons-material/Devices";
import DownloadIcon from "@mui/icons-material/Download";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RadarIcon from "@mui/icons-material/Radar";
import SummarizeIcon from "@mui/icons-material/Summarize";
import TableChartIcon from "@mui/icons-material/TableChart";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Icons

// Shared Components
import PageHeader from "../components/common/PageHeader";
import reportService from "../services/reportService";

const REPORT_CARDS = [
  {
    id: "infra-summary",
    title: "Infrastructure Summary",
    description:
      "Total assets, health score, risk level, latency, and packet loss metrics aggregated from the live SQLite repository.",
    icon: SummarizeIcon,
    color: "primary.main",
    actions: [
      {
        label: "Download PDF",
        format: "pdf",
        fn: () => reportService.infrastructureSummaryPdf(),
      },
    ],
  },
  {
    id: "asset-inventory",
    title: "Asset Inventory",
    description:
      "Complete inventory of all discovered assets including IP, hostname, vendor, device type, status, availability, and timestamps.",
    icon: DevicesIcon,
    color: "success.main",
    actions: [
      {
        label: "Download PDF",
        format: "pdf",
        fn: () => reportService.assetInventoryPdf(),
      },
      { label: "Export CSV", format: "csv", fn: () => reportService.assetInventoryCsv() },
    ],
  },
  {
    id: "discovery-history",
    title: "Discovery History",
    description:
      "Chronological record of all subnet scans performed — including date, subnet, devices found, reachable count, and duration.",
    icon: RadarIcon,
    color: "info.main",
    actions: [
      {
        label: "Download PDF",
        format: "pdf",
        fn: () => reportService.discoveryHistoryPdf(),
      },
      {
        label: "Export CSV",
        format: "csv",
        fn: () => reportService.discoveryHistoryCsv(),
      },
    ],
  },
  {
    id: "monitoring-summary",
    title: "Monitoring Summary",
    description:
      "Current monitoring engine status, average latency, packet loss, device availability, and health counts from the live daemon.",
    icon: MonitorHeartIcon,
    color: "warning.main",
    actions: [
      {
        label: "Download PDF",
        format: "pdf",
        fn: () => reportService.monitoringSummaryPdf(),
      },
    ],
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState({});
  const [error, setError] = useState(null);
  const [recentDownloads, setRecentDownloads] = useState([]);

  const handleDownload = async (cardId, actionLabel, fn) => {
    const key = `${cardId}-${actionLabel}`;
    setGenerating((prev) => ({ ...prev, [key]: true }));
    setError(null);
    try {
      await fn();
      setRecentDownloads((prev) => [
        { label: actionLabel, card: cardId, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to generate report. Please ensure the backend server is running."
      );
    } finally {
      setGenerating((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      {/* Page Header */}
      <PageHeader
        breadcrumb="ZORVIA / ENTERPRISE REPORTS"
        title="Infrastructure Reports & Exports"
        subtitle="Generate professional PDF reports and CSV exports from live SQLite infrastructure data."
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {REPORT_CARDS.map((card) => {
          const IconComp = card.icon;
          return (
            <Grid item xs={12} sm={6} key={card.id}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  borderColor: "divider",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 12px rgba(2,132,199,0.08)",
                  },
                }}
              >
                <CardContent
                  sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}
                >
                  {/* Header row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "rgba(2,132,199,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComp sx={{ color: card.color, fontSize: 22 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Chip
                      label="Live Data"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.68rem" }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5, flexGrow: 1 }}
                  >
                    {card.description}
                  </Typography>

                  {/* Action buttons */}
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {card.actions.map((action) => {
                      const key = `${card.id}-${action.label}`;
                      const busy = generating[key];
                      const isPdf = action.format === "pdf";
                      return (
                        <Button
                          key={action.label}
                          variant={isPdf ? "contained" : "outlined"}
                          size="small"
                          startIcon={
                            busy ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : isPdf ? (
                              <PictureAsPdfIcon fontSize="small" />
                            ) : (
                              <TableChartIcon fontSize="small" />
                            )
                          }
                          onClick={() => handleDownload(card.id, action.label, action.fn)}
                          disabled={busy}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            px: 2,
                          }}
                        >
                          {busy ? "Generating..." : action.label}
                        </Button>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Downloads Panel */}
      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <DownloadIcon fontSize="small" color="primary" />
            Recent Generated Reports
          </Typography>

          {recentDownloads.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No reports generated during this session. Select a report above and click
              Generate to download.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {recentDownloads.map((dl, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: idx === 0 ? "rgba(2,132,199,0.06)" : "transparent",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={dl.label.includes("CSV") ? "CSV" : "PDF"}
                      size="small"
                      color={dl.label.includes("CSV") ? "default" : "primary"}
                      sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {REPORT_CARDS.find((c) => c.id === dl.card)?.title || dl.card}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {dl.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
