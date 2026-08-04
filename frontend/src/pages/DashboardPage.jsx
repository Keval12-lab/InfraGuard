import React from "react";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DevicesIcon from "@mui/icons-material/Devices";
import GppBadIcon from "@mui/icons-material/GppBad";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RadarIcon from "@mui/icons-material/Radar";
import RecommendIcon from "@mui/icons-material/Recommend";
import RefreshIcon from "@mui/icons-material/Refresh";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SpeedIcon from "@mui/icons-material/Speed";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

// Shared Components & Custom Hooks
import IGPage from "../components/ui/IGPage";
import IGPageHeader from "../components/ui/IGPageHeader";
import IGSection from "../components/ui/IGSection";
import IGCard from "../components/ui/IGCard";
import IGMetricCard from "../components/ui/IGMetricCard";
import IGStatusChip from "../components/ui/IGStatusChip";
import IGEmptyState from "../components/ui/IGEmptyState";
import useDashboard from "../hooks/useDashboard";
import useIntelligence from "../hooks/useIntelligence";
import { useMonitoringSummary, useMonitoringStatus } from "../hooks/useMonitoring";

export default function DashboardPage() {
  const navigate = useNavigate();

  // TanStack React Query Hooks
  const {
    data: dashboardData,
    isLoading: isDashLoading,
    isError: isDashError,
    error: dashError,
    refetch: refetchDash,
  } = useDashboard();
  const {
    data: summaryData,
    isLoading: isSumLoading,
    isError: isSumError,
    error: sumError,
    refetch: refetchSum,
  } = useMonitoringSummary();
  const {
    data: monitoredAssetsData,
    isLoading: isStatusLoading,
    isError: isStatusError,
    error: statusError,
    refetch: refetchStatus,
  } = useMonitoringStatus();
  const {
    data: intelData,
    isLoading: isIntelLoading,
    refetch: refetchIntel,
  } = useIntelligence();

  const isLoading = isDashLoading || isSumLoading || isStatusLoading;
  const isError = isDashError || isSumError || isStatusError;
  const errorMessage =
    dashError?.message ||
    sumError?.message ||
    statusError?.message ||
    "Monitoring service is temporarily unavailable.";

  const handleRefreshAll = () => {
    refetchDash();
    refetchSum();
    refetchStatus();
    refetchIntel();
  };

  const monitoredAssets = Array.isArray(monitoredAssetsData) ? monitoredAssetsData : [];
  const totalAssets = dashboardData?.total_assets ?? monitoredAssets.length ?? 0;
  const healthyCount = summaryData?.healthy_count ?? 0;
  const warningCount = summaryData?.warning_count ?? 0;
  const offlineCount = summaryData?.offline_count ?? 0;
  const avgLatency = summaryData?.avg_latency_ms ?? 0.0;
  const avgLoss = summaryData?.avg_packet_loss_percent ?? 0.0;
  const healthScore = intelData?.health_score ?? (totalAssets > 0 ? 100 : 0);
  const healthLabel =
    intelData?.health_label ?? (totalAssets > 0 ? "Good" : "Awaiting Scan");
  const lastDiscoveryTime = dashboardData?.last_discovery
    ? new Date(dashboardData.last_discovery).toLocaleString()
    : "No Scan Run";

  const summaryCards = [
    {
      title: "Infrastructure Assets",
      value: totalAssets,
      caption: "Monitored endpoints in SQLite",
      icon: DevicesIcon,
      color: "primary.main",
    },
    {
      title: "Healthy Devices",
      value: healthyCount,
      caption: "Ping < 100ms | Loss < 10%",
      icon: CheckCircleOutlineIcon,
      color: "success.main",
    },
    {
      title: "Warning Devices",
      value: warningCount,
      caption: "High latency or packet loss",
      icon: WarningAmberIcon,
      color: "warning.main",
    },
    {
      title: "Offline Devices",
      value: offlineCount,
      caption: "Unreachable endpoints",
      icon: HighlightOffIcon,
      color: "error.main",
    },
    {
      title: "Average Latency",
      value: `${avgLatency} ms`,
      caption: "ICMP round-trip time",
      icon: SpeedIcon,
      color: "info.main",
      isMono: true,
    },
    {
      title: "Average Packet Loss",
      value: `${avgLoss}%`,
      caption: "Packet loss ratio",
      icon: SignalCellularAltIcon,
      color: "secondary.main",
      isMono: true,
    },
  ];

  return (
    <IGPage>
      <IGPageHeader
        title="InfraGuard Overview"
        subtitle={`Monitoring Running • Last Scan: ${lastDiscoveryTime}`}
        icon={<HealthAndSafetyIcon />}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RadarIcon />}
              onClick={() => navigate("/discovery")}
            >
              Start Discovery
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAll}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Stack>
        }
      />
      {/* ──── SECTION HEADER: Summary Metrics ──── */}
      <IGSection title="Telemetry Metrics">
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <IGCard variant="metric" noPadding>
                    <Skeleton variant="rectangular" height={100} />
                  </IGCard>
                </Grid>
              ))
            : summaryCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <IGMetricCard
                    title={card.title}
                    value={card.value}
                    caption={card.caption}
                    icon={card.icon}
                    color={card.color}
                    isMono={card.isMono}
                  />
                </Grid>
              ))}
        </Grid>
      </IGSection>

      {/* ──── SECTION: Intelligence & Monitored Assets Grid ──── */}
      <IGSection title="Infrastructure Intelligence & Assets">
        <Grid container spacing={3}>
          {/* Left: Monitored Asset Health & Performance Table */}
          <Grid item xs={12} md={8} xl={9}>
            <IGCard
              title="Monitored Assets"
              subtitle={`${monitoredAssets.length} active devices`}
              noPadding
            >

              {isLoading && (
                <Stack spacing={1}>
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Stack>
              )}

              {!isLoading && monitoredAssets.length === 0 && (
                <IGEmptyState
                  icon={<RadarIcon />}
                  title="No Monitored Assets Found"
                  description="Run a network discovery scan to automatically populate your asset repository."
                  action={
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate("/discovery")}
                    >
                      Run Network Discovery
                    </Button>
                  }
                />
              )}

              {!isLoading && monitoredAssets.length > 0 && (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2, maxHeight: 380 }}
                >
                  <Table size="small" stickyHeader aria-label="Monitored devices">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>Hostname</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Latency</TableCell>
                        <TableCell align="right">Packet Loss</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monitoredAssets.map((asset) => (
                        <TableRow
                          key={asset.id}
                          hover
                          sx={{
                            "&:hover": { bgcolor: "action.hover", cursor: "pointer" },
                          }}
                          onClick={() => navigate("/assets")}
                        >
                          <TableCell>
                            <IGStatusChip status={asset.status} />
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            {asset.ip_address}
                          </TableCell>
                          <TableCell sx={{ color: "text.primary" }}>
                            {asset.hostname || asset.device_name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={asset.device_type || "Generic"}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            className="font-mono"
                            sx={{ fontWeight: 600 }}
                          >
                            {asset.latency_ms !== null ? `${asset.latency_ms} ms` : "--"}
                          </TableCell>
                          <TableCell align="right" className="font-mono">
                            {asset.packet_loss !== null ? `${asset.packet_loss}%` : "--"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </IGCard>
          </Grid>

          {/* Right: Quick Actions & System Info */}
          <Grid item xs={12} md={4} xl={3}>
            <IGCard title="Quick Operations">
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<RadarIcon />}
                  fullWidth
                  onClick={() => navigate("/discovery")}
                  sx={{ py: 1.2, fontWeight: 600, borderRadius: 2 }}
                >
                  Start Subnet Discovery
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<InventoryIcon />}
                  fullWidth
                  onClick={() => navigate("/assets")}
                  sx={{ py: 1.2, fontWeight: 600, borderRadius: 2 }}
                >
                  Manage Asset Repository ({totalAssets})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<InfoOutlinedIcon />}
                  fullWidth
                  onClick={() => navigate("/reports")}
                  sx={{ py: 1.2, fontWeight: 600, borderRadius: 2 }}
                >
                  Generate Reports
                </Button>
              </Stack>
            </IGCard>
          </Grid>
        </Grid>
      </IGSection>

      {isIntelLoading && (
        <IGSection>
          <Grid container spacing={3}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} md={4} key={i}>
                <IGCard>
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="rectangular" height={60} sx={{ my: 1 }} />
                </IGCard>
              </Grid>
            ))}
          </Grid>
        </IGSection>
      )}

      {!isIntelLoading && (!intelData || intelData.total_assets === 0) && (
        <IGSection>
          <IGCard>
            <Box sx={{ p: 3, textAlign: "center" }}>
              <TipsAndUpdatesIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                No Intelligence Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Run your first network discovery to generate rule-based findings and
                recommendations.
              </Typography>
            </Box>
          </IGCard>
        </IGSection>
      )}

      {!isIntelLoading && intelData && intelData.total_assets > 0 && (
        <IGSection title="Active Diagnostics">
          <Grid container spacing={3}>
            {/* Critical Alerts */}
            <Grid item xs={12} md={4}>
              <IGCard
                variant={intelData.critical_alerts.length > 0 ? "danger" : "default"}
                title="Critical Alerts"
                action={
                  <Chip
                    label={intelData.critical_alerts.length}
                    size="small"
                    color={intelData.critical_alerts.length > 0 ? "error" : "default"}
                    sx={{ fontWeight: 700 }}
                  />
                }
              >
                {intelData.critical_alerts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No critical issues detected. All critical infrastructure devices are
                    reachable.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {intelData.critical_alerts.map((a, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(239,68,68,0.06)",
                          borderLeft: "3px solid",
                          borderColor: "error.main",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.3 }}>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.detail}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </IGCard>
            </Grid>

            {/* Warnings */}
            <Grid item xs={12} md={4}>
              <IGCard
                variant={intelData.warnings.length > 0 ? "warning" : "default"}
                title="Warnings"
                action={
                  <Chip
                    label={intelData.warnings.length}
                    size="small"
                    color={intelData.warnings.length > 0 ? "warning" : "default"}
                    sx={{ fontWeight: 700 }}
                  />
                }
              >
                {intelData.warnings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No warnings. Network performance is operating within normal
                    parameters.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {intelData.warnings.map((w, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(245,158,11,0.06)",
                          borderLeft: "3px solid",
                          borderColor: "warning.main",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.3 }}>
                          {w.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {w.detail}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actionable Recommendations */}
          <Grid item xs={12} md={4}>
            <IGCard
              title="Recommendations"
              action={
                <Chip
                  label={intelData.recommendations.length}
                  size="small"
                  color="info"
                  sx={{ fontWeight: 700 }}
                />
              }
            >
              {intelData.recommendations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No actionable recommendations at this time.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {intelData.recommendations.map((r, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(2,132,199,0.06)",
                          borderLeft: "3px solid",
                          borderColor:
                            r.priority === "critical"
                              ? "error.main"
                              : r.priority === "high"
                                ? "warning.main"
                                : "info.main",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            mb: 0.3,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {r.title}
                          </Typography>
                          <Chip
                            label={r.priority}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 16,
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {r.detail}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </IGCard>
            </Grid>
          </Grid>
        </IGSection>
      )}
    </IGPage>
  );
}
