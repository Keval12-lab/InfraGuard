import React, { useState } from "react";

import HubIcon from "@mui/icons-material/Hub";
import InfoIcon from "@mui/icons-material/Info";
import LanIcon from "@mui/icons-material/Lan";
import MemoryIcon from "@mui/icons-material/Memory";
import RouterIcon from "@mui/icons-material/Router";
import SyncIcon from "@mui/icons-material/Sync";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

// Icons

import {
  useSnmpDevice,
  useSnmpInterfaces,
  useSnmpNeighbors,
  useSnmpVlans,
  useDiscoverSnmp,
} from "../../hooks/useSnmp";

export default function SnmpInspectorDialog({ open, onClose, deviceId }) {
  const {
    data: snmpDevice,
    isLoading: isDeviceLoading,
    error: deviceError,
  } = useSnmpDevice(deviceId);
  const { data: interfaces, isLoading: isInterfacesLoading } =
    useSnmpInterfaces(deviceId);
  const { data: neighbors, isLoading: isNeighborsLoading } = useSnmpNeighbors(deviceId);
  const { data: vlans, isLoading: isVlansLoading } = useSnmpVlans(deviceId);

  const { mutateAsync: discoverSnmp, isPending: isSyncing } = useDiscoverSnmp();

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTriggerDiscovery = async () => {
    try {
      await discoverSnmp(deviceId);
    } catch (err) {
      console.error("SNMP Discover error:", err);
    }
  };

  const hasNotScanned = Boolean(deviceError);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <RouterIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              SNMP Enterprise Inspector
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Querying Layer 2/3 Switch and Router Metadata via SNMP v2c
            </Typography>
          </Box>
        </Stack>

        {!hasNotScanned && (
          <Button
            size="small"
            variant="contained"
            startIcon={
              isSyncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />
            }
            disabled={isSyncing}
            onClick={handleTriggerDiscovery}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            {isSyncing ? "Syncing..." : "Scan SNMP"}
          </Button>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 0, minHeight: 400 }}>
        {isDeviceLoading ? (
          <Box sx={{ p: 4 }}>
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ mb: 2, borderRadius: 2 }}
            />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Box>
        ) : hasNotScanned ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <InfoIcon sx={{ fontSize: 52, color: "text.secondary", mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              No SNMP Data Scanned Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This device has not been queried for active SNMP v2c details. Initiate a
              quick SNMP sweep discovery now.
            </Typography>
            <Button
              variant="contained"
              startIcon={
                isSyncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />
              }
              disabled={isSyncing}
              onClick={handleTriggerDiscovery}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {isSyncing ? "Scanning..." : "Initialize SNMP Discovery"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
            >
              <Tab
                label="System Overview"
                icon={<InfoIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 600 }}
              />
              <Tab
                label="Interfaces"
                icon={<LanIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 600 }}
              />
              <Tab
                label="VLANs"
                icon={<HubIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 600 }}
              />
              <Tab
                label="LLDP Neighbors"
                icon={<MemoryIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 600 }}
              />
            </Tabs>

            {/* TAB 0: System Overview */}
            {activeTab === 0 && snmpDevice && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      System Name (sysName)
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      {snmpDevice.sys_name || "N/A"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      System Description (sysDescr)
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                      {snmpDevice.sys_desc || "N/A"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      System Contact (sysContact)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {snmpDevice.sys_contact || "N/A"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      System Location (sysLocation)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {snmpDevice.sys_location || "N/A"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      System Uptime
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {snmpDevice.sys_uptime
                        ? `${(snmpDevice.sys_uptime / 3600).toFixed(1)} Hours`
                        : "N/A"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      Interface Count
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {snmpDevice.interface_count || 0} Ports discovered
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TAB 1: Interfaces */}
            {activeTab === 1 && (
              <Box sx={{ p: 2 }}>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 350, borderRadius: 2 }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Port Index</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Interface Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Speed</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Errors</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>CRC</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interfaces?.map((face) => (
                        <TableRow key={face.id} hover>
                          <TableCell className="font-mono">{face.if_index}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{face.if_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={face.if_status}
                              size="small"
                              color={face.if_status === "UP" ? "success" : "default"}
                              sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell className="font-mono">
                            {face.if_speed > 0 ? `${face.if_speed} Mbps` : "Disconnected"}
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            sx={{
                              color: face.errors > 0 ? "error.main" : "text.primary",
                            }}
                          >
                            {face.errors}
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            sx={{ color: face.crc > 0 ? "error.main" : "text.primary" }}
                          >
                            {face.crc}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* TAB 2: VLANs */}
            {activeTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {vlans?.map((v) => (
                    <Grid item xs={12} sm={6} md={4} key={v.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {v.vlan_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            VLAN ID: {v.vlan_id}
                          </Typography>
                        </Box>
                        <Chip
                          label={`ID ${v.vlan_id}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: "0.65rem" }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* TAB 3: LLDP Neighbors */}
            {activeTab === 3 && (
              <Box sx={{ p: 3 }}>
                {neighbors?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No LLDP neighbors detected on interfaces.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {neighbors?.map((n) => (
                      <Paper key={n.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={4}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              LOCAL INTERFACE
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {n.local_port}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            <Typography
                              variant="body2"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            >
                              ────────▶
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              NEIGHBOR DEVICE & PORT
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {n.neighbor_name} ({n.neighbor_port})
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Close Dialog
        </Button>
      </DialogActions>
    </Dialog>
  );
}
