import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import RouterIcon from "@mui/icons-material/Router";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// Shared Reusable Components & Hooks
import InfrastructurePassportDialog from "../components/assets/InfrastructurePassportDialog";
import SnmpInspectorDialog from "../components/assets/SnmpInspectorDialog";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import SectionHeader from "../components/common/SectionHeader";
import StatusChip from "../components/common/StatusChip";
import useAssets from "../hooks/useAssets";
import { searchFilterSchema } from "../schemas/discoverySchema";

export default function AssetsPage() {
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "ALL",
    vendor: "ALL",
    device_type: "ALL",
  });
  const [passportDeviceId, setPassportDeviceId] = useState(null);
  const [snmpDeviceId, setSnmpDeviceId] = useState(null);
  const navigate = useNavigate();

  // React Hook Form with Zod Validation
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(searchFilterSchema),
    defaultValues: {
      search: "",
      status: "ALL",
      vendor: "ALL",
      device_type: "ALL",
    },
  });

  // TanStack Query Hook
  const { data, isLoading, isError, error, refetch } = useAssets(appliedFilters);
  const assets = Array.isArray(data) ? data : [];

  const onFilterSubmit = (formValues) => {
    setAppliedFilters(formValues);
  };

  const uniqueVendors = Array.from(new Set(assets.map((a) => a.vendor).filter(Boolean)));

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumb="ZORVIA / ASSET REPOSITORY"
        title="Infrastructure Asset Repository"
        subtitle="Centralized persistent inventory of discovered network assets and live monitoring metrics."
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            Refresh Inventory
          </Button>
        }
      />

      {/* 2. Filter & Search Controls Bar (React Hook Form + Zod) */}
      <Card sx={{ mb: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            component="form"
            onSubmit={handleSubmit(onFilterSubmit)}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            {/* Search Input */}
            <Controller
              name="search"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  placeholder="Search IP, Hostname, Vendor..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 260, flexGrow: 1 }}
                />
              )}
            />

            {/* Status Filter */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Status"
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="Healthy">Healthy</MenuItem>
                  <MenuItem value="Warning">Warning</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </TextField>
              )}
            />

            {/* Vendor Filter */}
            <Controller
              name="vendor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Vendor"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="ALL">All Vendors</MenuItem>
                  {uniqueVendors.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Device Type Filter */}
            <Controller
              name="device_type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Device Type"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="ALL">All Device Types</MenuItem>
                  <MenuItem value="Desktop">Desktop (Estimated)</MenuItem>
                  <MenuItem value="Laptop">Laptop (Estimated)</MenuItem>
                  <MenuItem value="Router">Router (Detected)</MenuItem>
                  <MenuItem value="Mobile">Mobile (Estimated)</MenuItem>
                  <MenuItem value="Printer">Printer (Estimated)</MenuItem>
                  <MenuItem value="Unknown">Unknown</MenuItem>
                </TextField>
              )}
            />

            {/* Apply Button */}
            <Button
              type="submit"
              variant="contained"
              size="medium"
              sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
            >
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error?.message || "Failed to load infrastructure asset repository."}
        </Alert>
      )}

      {/* 3. Assets Table Section */}
      <Box sx={{ mt: 2 }}>
        <SectionHeader
          title="Monitored Infrastructure Assets"
          description={`Displaying ${assets.length} registered infrastructure assets with continuous SLA monitoring metrics.`}
        />

        {/* Loading Skeleton State */}
        {isLoading && (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 3, p: 2 }}
          >
            <Skeleton variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          </TableContainer>
        )}

        {/* Empty State */}
        {!isLoading && assets.length === 0 && (
          <EmptyState
            icon={<InventoryIcon sx={{ fontSize: 52, color: "primary.main" }} />}
            title="No Infrastructure Assets Discovered Yet"
            description="No assets found matching your criteria. Perform your first network discovery scan to automatically populate the persistent asset inventory."
            action={
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate("/discovery")}
                sx={{ borderRadius: 2 }}
              >
                Run Discovery Scan
              </Button>
            }
          />
        )}

        {/* Assets Table (Read-Only with Monitoring Data) */}
        {!isLoading && assets.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Asset ID
                  </TableCell>
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
                    Vendor
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Device Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Availability
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Latency
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Packet Loss
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Last Monitor
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                    Scans
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "text.primary", textAlign: "right" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((dev) => {
                  const assetIdStr = `#AS-${String(dev.id).padStart(3, "0")}`;
                  const statusVal = dev.status || "Healthy";
                  const hostnameVal =
                    dev.hostname && dev.hostname !== "Not Available"
                      ? dev.hostname
                      : "Not Available";
                  const vendorVal = dev.vendor || "Unknown";
                  const devTypeVal = dev.device_type || "Unknown";
                  const discoveryCount = dev.discovery_count || 1;
                  const latencyVal =
                    dev.latency_ms !== undefined ? `${dev.latency_ms} ms` : "0 ms";
                  const lossVal =
                    dev.packet_loss !== undefined ? `${dev.packet_loss}%` : "0%";
                  const availVal =
                    dev.availability_percent !== undefined
                      ? `${dev.availability_percent}%`
                      : "100%";
                  const lastMonVal = dev.last_monitor_time || dev.last_seen;

                  return (
                    <TableRow key={dev.id || dev.ip_address} hover>
                      <TableCell
                        className="font-mono"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {assetIdStr}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={statusVal} label={statusVal} />
                      </TableCell>
                      <TableCell
                        className="font-mono"
                        sx={{ fontWeight: 600, fontSize: "0.9rem" }}
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
                      <TableCell
                        className="font-mono"
                        sx={{ fontWeight: 600, color: "success.main" }}
                      >
                        {availVal}
                      </TableCell>
                      <TableCell className="font-mono">{latencyVal}</TableCell>
                      <TableCell className="font-mono">{lossVal}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        {lastMonVal
                          ? new Date(lastMonVal).toLocaleString()
                          : "Not Available"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                        <Chip
                          label={`${discoveryCount}x`}
                          size="small"
                          color="default"
                          sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VerifiedIcon fontSize="small" />}
                            onClick={() => setPassportDeviceId(dev.id)}
                            sx={{
                              borderRadius: 2.5,
                              fontWeight: 600,
                              textTransform: "none",
                            }}
                          >
                            Passport
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<RouterIcon fontSize="small" />}
                            onClick={() => setSnmpDeviceId(dev.id)}
                            sx={{
                              borderRadius: 2.5,
                              fontWeight: 600,
                              textTransform: "none",
                            }}
                          >
                            SNMP
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Infrastructure Passport Modal */}
        {passportDeviceId && (
          <InfrastructurePassportDialog
            open={Boolean(passportDeviceId)}
            onClose={() => setPassportDeviceId(null)}
            deviceId={passportDeviceId}
          />
        )}

        {/* SNMP Inspector Modal */}
        {snmpDeviceId && (
          <SnmpInspectorDialog
            open={Boolean(snmpDeviceId)}
            onClose={() => setSnmpDeviceId(null)}
            deviceId={snmpDeviceId}
          />
        )}
      </Box>
    </Box>
  );
}
