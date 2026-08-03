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

// Icons
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

// Shared Components & Custom Hooks
import EmptyState from "../components/common/EmptyState";
import StatusChip from "../components/common/StatusChip";
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: 1280,
        mx: "auto",
        pb: 6,
      }}
    >
      {/* ──── HERO: Infrastructure Health Hero Banner ──── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3.5,
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <HealthAndSafetyIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            InfraGuard Infrastructure Health
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          {/* Health Score & Status Label */}
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ textAlign: "center", borderRight: { sm: "1px solid #E2E8F0" } }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color:
                  healthScore >= 75
                    ? "success.main"
                    : healthScore >= 50
                      ? "warning.main"
                      : "error.main",
              }}
            >
              {isIntelLoading ? (
                <Skeleton width={90} sx={{ mx: "auto" }} />
              ) : (
                `${healthScore} / 100`
              )}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color:
                  healthScore >= 75
                    ? "success.main"
                    : healthScore >= 50
                      ? "warning.main"
                      : "error.main",
              }}
            >
              {healthLabel}
            </Typography>
          </Grid>

          {/* Quick Device Counts & Status Line */}
          <Grid item xs={12} sm={8}>
            <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Healthy Devices
                </Typography>
                <Typography
                  variant="body2"
                  className="font-mono"
                  sx={{ fontWeight: 700 }}
                >
                  {healthyCount}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmberIcon color="warning" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Warning
                </Typography>
                <Typography
                  variant="body2"
                  className="font-mono"
                  sx={{ fontWeight: 700 }}
                >
                  {warningCount}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HighlightOffIcon color="error" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Offline
                </Typography>
                <Typography
                  variant="body2"
                  className="font-mono"
                  sx={{ fontWeight: 700 }}
                >
                  {offlineCount}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box
                className="pulse-live"
                sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Monitoring Running • Last Scan: {lastDiscoveryTime}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* Top Recommendation & Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ maxWidth: "65%" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Top Recommendation
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", mt: 0.3 }}
            >
              {intelData?.recommendations?.[0]
                ? `${intelData.recommendations[0].title} — ${intelData.recommendations[0].detail}`
                : "All systems operational. No critical remediation required."}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              startIcon={<RadarIcon />}
              onClick={() => navigate("/discovery")}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Start Discovery
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InventoryIcon />}
              onClick={() => navigate("/assets")}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              View Assets
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Error Alert */}
      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {errorMessage} Retrying automatically during next background refresh cycle.
        </Alert>
      )}

      {/* ──── SECTION HEADER: Summary Metrics ──── */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          Telemetry Metrics
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshAll}
          disabled={isLoading}
          sx={{ fontWeight: 600 }}
        >
          {isLoading ? "Refreshing..." : "Refresh Telemetry"}
        </Button>
      </Box>

      {/* Metric Cards Grid */}
      <Grid container spacing={2.5}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton
                    variant="rectangular"
                    width="80%"
                    height={36}
                    sx={{ my: 1, borderRadius: 1 }}
                  />
                  <Skeleton variant="text" width="40%" height={16} />
                </Card>
              </Grid>
            ))
          : summaryCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600, textTransform: "uppercase" }}
                        >
                          {card.title}
                        </Typography>
                        <Box
                          sx={{
                            p: 0.8,
                            borderRadius: 1.5,
                            bgcolor: "rgba(2, 132, 199, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconComponent sx={{ color: card.color, fontSize: 20 }} />
                        </Box>
                      </Box>
                      <Typography
                        variant="h4"
                        component="div"
                        className={card.isMono ? "font-mono" : ""}
                        sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
                      >
                        {card.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {card.caption}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
      </Grid>

      {/* ──── SECTION: Intelligence & Monitored Assets Grid ──── */}
      <Grid container spacing={2.5}>
        {/* Left: Monitored Asset Health & Performance Table */}
        <Grid item xs={12} md={8}>
          <Card
            variant="outlined"
            sx={{ height: "100%", borderRadius: 3, borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                  Monitored Infrastructure Assets
                </Typography>
                <Chip
                  label={`${monitoredAssets.length} active`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {isLoading && (
                <Stack spacing={1}>
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Stack>
              )}

              {!isLoading && monitoredAssets.length === 0 && (
                <EmptyState
                  icon={<RadarIcon sx={{ fontSize: 48, color: "primary.main" }} />}
                  title="No Monitored Assets Found"
                  description="Run a network discovery scan to automatically populate your asset repository."
                  action={
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate("/discovery")}
                      sx={{ borderRadius: 2, px: 3 }}
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
                            <StatusChip status={asset.status} />
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
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Quick Actions & System Info */}
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{ height: "100%", borderRadius: 3, borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Quick Operations
              </Typography>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ──── SECTION: Infrastructure Intelligence ──── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TipsAndUpdatesIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            Infrastructure Intelligence & Rule Findings
          </Typography>
        </Box>
        {!isIntelLoading && intelData && (
          <Chip
            label={`Rules Checked: 7 Active`}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {isIntelLoading && (
        <Grid container spacing={2.5}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton
                  variant="rectangular"
                  height={60}
                  sx={{ my: 1, borderRadius: 1 }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!isIntelLoading && (!intelData || intelData.total_assets === 0) && (
        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <TipsAndUpdatesIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              No Intelligence Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Run your first network discovery to generate rule-based findings and
              recommendations.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!isIntelLoading && intelData && intelData.total_assets > 0 && (
        <Grid container spacing={2.5}>
          {/* Critical Alerts */}
          <Grid item xs={12} md={4}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor:
                  intelData.critical_alerts.length > 0 ? "error.main" : "divider",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <GppBadIcon sx={{ color: "error.main", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Critical Alerts
                  </Typography>
                  <Chip
                    label={intelData.critical_alerts.length}
                    size="small"
                    color={intelData.critical_alerts.length > 0 ? "error" : "default"}
                    sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
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
              </CardContent>
            </Card>
          </Grid>

          {/* Warnings */}
          <Grid item xs={12} md={4}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: intelData.warnings.length > 0 ? "warning.main" : "divider",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <WarningAmberIcon sx={{ color: "warning.main", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Warnings
                  </Typography>
                  <Chip
                    label={intelData.warnings.length}
                    size="small"
                    color={intelData.warnings.length > 0 ? "warning" : "default"}
                    sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
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
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, borderColor: "divider", height: "100%" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <RecommendIcon sx={{ color: "info.main", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Recommendations
                  </Typography>
                  <Chip
                    label={intelData.recommendations.length}
                    size="small"
                    color="info"
                    sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
