import React, { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DevicesIcon from "@mui/icons-material/Devices";
import DnsIcon from "@mui/icons-material/Dns";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RadarIcon from "@mui/icons-material/Radar";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm, Controller } from "react-hook-form";

// Icons

// Shared Reusable Components & Hooks
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import SectionHeader from "../components/common/SectionHeader";
import StatusChip from "../components/common/StatusChip";
import NetworkIdentityCard from "../components/discovery/NetworkIdentityCard";
import NetworkQualityCard from "../components/discovery/NetworkQualityCard";
import { useSubnetDetection, useStartDiscoveryScan, useNetworkQuality } from "../hooks/useDiscovery";
import { cidrFormSchema } from "../schemas/discoverySchema";

const WORKFLOW_STEPS = [
  "Choose Network",
  "Review Scan Options",
  "Run Discovery",
  "Review Results",
];

export default function DiscoveryPage() {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // TanStack Query Hooks
  const {
    data: detectedSubnetData,
    isLoading: isDetecting,
    refetch: refetchSubnet,
    isRefetching: isRefetchingSubnet,
  } = useSubnetDetection();
  
  const {
    data: networkQualityData,
    isLoading: isDetectingQuality,
    refetch: refetchQuality,
    isRefetching: isRefetchingQuality,
  } = useNetworkQuality();
  const scanMutation = useStartDiscoveryScan();

  // React Hook Form with Zod Validation
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cidrFormSchema),
    defaultValues: {
      subnet: "",
      protocol: "icmp",
    },
  });

  const cidrValue = watch("subnet");
  const isScanning = scanMutation.isPending;
  const activeStep = isScanning ? 2 : scanResult ? 3 : cidrValue ? 1 : 0;

  // Auto populate subnet when detection succeeds
  useEffect(() => {
    if (detectedSubnetData?.detected_cidr) {
      setValue("subnet", detectedSubnetData.detected_cidr, { shouldValidate: true });
    }
  }, [detectedSubnetData, setValue]);

  const onScanSubmit = (formValues) => {
    setErrorMessage(null);
    scanMutation.mutate(formValues.subnet, {
      onSuccess: (data) => {
        setScanResult(data);
      },
      onError: (err) => {
        setErrorMessage(err?.message || "Failed to execute network discovery scan.");
      },
    });
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumb="ZORVIA / NETWORK DISCOVERY"
        title="Network Asset Discovery"
        subtitle="Powered by InfraGuard Engine — Auto-detect local subnets and discover active infrastructure hosts."
        action={
          <Button
            variant="outlined"
            startIcon={
              isDetecting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MyLocationIcon />
              )
            }
            onClick={() => refetchSubnet()}
            disabled={isDetecting || isScanning}
            sx={{ borderRadius: 2 }}
          >
            {isDetecting ? "Detecting Subnet..." : "Auto Detect Network"}
          </Button>
        }
      />

      {/* 2. Enterprise Workflow Stepper Bar */}
      <Card sx={{ mb: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ py: 2.5, px: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {WORKFLOW_STEPS.map((label, idx) => (
              <Step key={label} completed={activeStep > idx}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      fontSize: 24,
                      "&.Mui-active": { color: "primary.main" },
                      "&.Mui-completed": { color: "success.main" },
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: activeStep === idx ? 700 : 500,
                      color: activeStep === idx ? "primary.main" : "text.secondary",
                    }}
                  >
                    Step {idx + 1}: {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* 3. Subnet Input & Interface Context Grid (React Hook Form + Zod) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3, component: "form" }}>
              <Box component="form" onSubmit={handleSubmit(onScanSubmit)}>
                <SectionHeader
                  title="Step 1: Choose Network Range"
                  description="Specify target IPv4 CIDR address range for network scanning."
                />
                <Box sx={{ mt: 2.5 }}>
                  <Controller
                    name="subnet"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Target Subnet CIDR"
                        variant="outlined"
                        placeholder="e.g. 192.168.29.0/24"
                        disabled={isScanning}
                        error={Boolean(errors.subnet)}
                        helperText={
                          errors.subnet?.message ||
                          "Format example: 192.168.29.0/24 (254 hosts max)."
                        }
                      />
                    )}
                  />
                </Box>

                {/* Step 2: Scan Protocol Options */}
                <Box
                  sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
                  >
                    Step 2: Review Scan Options
                  </Typography>
                  <Controller
                    name="protocol"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="icmp"
                          control={<Radio color="primary" size="small" />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ICMP Ping Discovery
                              </Typography>
                              <Chip
                                label="Active Protocol"
                                color="primary"
                                size="small"
                                sx={{ height: 20, fontSize: "0.68rem" }}
                              />
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="snmp"
                          disabled
                          control={<Radio size="small" />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                SNMP Deep Discovery
                              </Typography>
                              <Chip
                                label="Future Scope"
                                variant="outlined"
                                size="small"
                                sx={{ height: 20, fontSize: "0.68rem" }}
                              />
                            </Box>
                          }
                        />
                      </RadioGroup>
                    )}
                  />
                </Box>

                {/* Step 3: Run Discovery Trigger */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={
                      isScanning ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <PlayArrowIcon />
                      )
                    }
                    disabled={isScanning}
                    sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 600 }}
                  >
                    {isScanning ? "Scanning Network..." : "Start Discovery"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Network Context & Quality Cards */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
            <Box sx={{ flex: 1 }}>
              <NetworkIdentityCard 
                data={detectedSubnetData} 
                isLoading={isDetecting} 
                isRefetching={isRefetchingSubnet} 
                onRefresh={refetchSubnet} 
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <NetworkQualityCard 
                data={networkQualityData} 
                isLoading={isDetectingQuality} 
                isRefetching={isRefetchingQuality} 
                onRefresh={refetchQuality} 
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* 4. Scanning Progress State */}
      {isScanning && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "primary.main",
            boxShadow: "0 0 12px rgba(2, 132, 199, 0.15)",
          }}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CircularProgress size={24} color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                  Scanning Subnet ({cidrValue})...
                </Typography>
              </Box>
              <StatusChip status="SCANNING" label="Scanning" />
            </Box>
            <LinearProgress sx={{ borderRadius: 2, height: 8, mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Step 3: Probing IP host addresses via multi-threaded ICMP requests...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 5. Error Banner */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Discovery Error</AlertTitle>
          {errorMessage}
        </Alert>
      )}

      {/* 6. Step 4: Comprehensive Discovery Summary Cards */}
      {scanResult && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Step 4: Discovery Summary
            </Typography>
            <StatusChip status="COMPLETED" label="Discovery Completed" />
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Subnet"
                value={scanResult.subnet}
                caption="Scanned IPv4 Range"
                icon={<DnsIcon fontSize="small" />}
                color="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Devices"
                value={scanResult.total_scanned}
                caption="Total Host Targets"
                icon={<DevicesIcon fontSize="small" />}
                color="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Reachable Devices"
                value={scanResult.active_found}
                caption="ICMP Ping Responded"
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Unreachable Devices"
                value={
                  scanResult.unreachable_count !== undefined
                    ? scanResult.unreachable_count
                    : scanResult.total_scanned - scanResult.active_found
                }
                caption="No Response / Filtered"
                icon={<SignalCellularAltIcon fontSize="small" />}
                color="warning.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.2}>
              <MetricCard
                title="Duration"
                value={`${scanResult.duration_seconds}s`}
                caption={
                  scanResult.scanned_at
                    ? new Date(scanResult.scanned_at).toLocaleTimeString()
                    : "Completed"
                }
                icon={<AccessTimeIcon fontSize="small" />}
                color="secondary.main"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 7. Results Table */}
      <Box sx={{ mt: 2 }}>
        <SectionHeader
          title="Discovered Network Assets"
          description={
            scanResult
              ? `Displaying ${scanResult.active_found} reachable hosts discovered on subnet ${scanResult.subnet}.`
              : "Discovered host IP addresses will appear here once a subnet scan completes."
          }
        />

        {!scanResult && !isScanning && (
          <EmptyState
            icon={<RadarIcon sx={{ fontSize: 52, color: "primary.main" }} />}
            title="No Discovery Performed Yet"
            description="Enter your local subnet CIDR above (e.g. 192.168.29.0/24) and click 'Start Discovery' to perform your network scan."
          />
        )}

        {scanResult && scanResult.devices.length === 0 && (
          <EmptyState
            icon={
              <CheckCircleOutlineIcon sx={{ fontSize: 52, color: "text.secondary" }} />
            }
            title="No Reachable Devices Discovered"
            description={`No host IP addresses on subnet ${scanResult.subnet} responded to ICMP ping probes.`}
          />
        )}

        {scanResult && scanResult.devices.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    IP Address
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Hostname
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Device Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Vendor
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Device Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Last Seen
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scanResult.devices.map((dev) => {
                  const isReachable = dev.reachable !== undefined ? dev.reachable : true;
                  const statusChipVal = isReachable ? "Healthy" : "Offline";
                  const hostnameVal =
                    dev.hostname && dev.hostname !== "Not Available"
                      ? dev.hostname
                      : "Not Available";
                  const devNameVal =
                    dev.device_name && dev.device_name !== "Not Available"
                      ? dev.device_name
                      : "Not Available";
                  const vendorVal =
                    dev.vendor && dev.vendor !== "Local Host" ? dev.vendor : "Unknown";
                  const devTypeVal = dev.device_type || "Unknown";
                  const lastSeenVal =
                    dev.last_seen || dev.discovery_timestamp || dev.discovered_at;

                  return (
                    <TableRow key={dev.ip_address} hover>
                      <TableCell>
                        <StatusChip status={statusChipVal} label={statusChipVal} />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {dev.ip_address}
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            hostnameVal === "Not Available"
                              ? "text.secondary"
                              : "text.primary",
                        }}
                      >
                        {hostnameVal}
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            devNameVal === "Not Available"
                              ? "text.secondary"
                              : "text.primary",
                        }}
                      >
                        {devNameVal}
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            vendorVal === "Unknown" ? "text.secondary" : "text.primary",
                        }}
                      >
                        {vendorVal}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={devTypeVal}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                        {lastSeenVal
                          ? new Date(lastSeenVal).toLocaleString()
                          : "Not Available"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
