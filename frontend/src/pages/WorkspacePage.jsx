import React, { useState } from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ComputerIcon from "@mui/icons-material/Computer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import LanguageIcon from "@mui/icons-material/Language";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SpeedIcon from "@mui/icons-material/Speed";
import TerminalIcon from "@mui/icons-material/Terminal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Icons

// Custom Hooks & Components
import PageHeader from "../components/common/PageHeader";
import SectionHeader from "../components/common/SectionHeader";
import { useWorkspaceHistory, useExecuteTool } from "../hooks/useWorkspace";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState(0);

  // Tool Inputs
  const [targetIp, setTargetIp] = useState("127.0.0.1");
  const [pingCount, setPingCount] = useState(4);
  const [portNum, setPortNum] = useState(80);
  const [dnsQuery, setDnsQuery] = useState("127.0.0.1");
  const [macAddr, setMacAddr] = useState("AA:BB:CC:DD:EE:FF");

  // Console Output Stream
  const [consoleOutput, setConsoleOutput] = useState(
    "[InfraGuard Engineer Workspace v1.1 Active]\nSelect a diagnostic tool above and execute commands directly against network assets."
  );
  const [lastExecutionStatus, setLastExecutionStatus] = useState(null);
  const [copiedText, setCopiedText] = useState("");

  const { data: historyData, isLoading: isHistoryLoading } = useWorkspaceHistory();
  const {
    runPing,
    isPingLoading,
    runPortCheck,
    isPortCheckLoading,
    runDnsLookup,
    isDnsLoading,
    runWol,
    isWolLoading,
  } = useExecuteTool();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handlePingSubmit = async (e) => {
    e.preventDefault();
    setConsoleOutput(
      `> Executing ICMP Ping against ${targetIp} (count: ${pingCount})...`
    );
    try {
      const res = await runPing({ ip: targetIp, count: pingCount });
      setLastExecutionStatus(res.success);
      setConsoleOutput(res.output);
    } catch (err) {
      setLastExecutionStatus(false);
      setConsoleOutput(`[Error] ${err.message || "Failed to execute ping diagnostic."}`);
    }
  };

  const handlePortSubmit = async (e) => {
    e.preventDefault();
    setConsoleOutput(`> Testing TCP Port ${portNum} on ${targetIp}...`);
    try {
      const res = await runPortCheck({ ip: targetIp, port: portNum });
      setLastExecutionStatus(res.success);
      setConsoleOutput(res.output);
    } catch (err) {
      setLastExecutionStatus(false);
      setConsoleOutput(`[Error] ${err.message || "Failed to execute port check."}`);
    }
  };

  const handleDnsSubmit = async (e) => {
    e.preventDefault();
    setConsoleOutput(`> Resolving DNS query '${dnsQuery}'...`);
    try {
      const res = await runDnsLookup({ query: dnsQuery });
      setLastExecutionStatus(res.success);
      setConsoleOutput(res.output);
    } catch (err) {
      setLastExecutionStatus(false);
      setConsoleOutput(`[Error] ${err.message || "Failed to execute DNS lookup."}`);
    }
  };

  const handleWolSubmit = async (e) => {
    e.preventDefault();
    setConsoleOutput(`> Broadcasting Wake-on-LAN magic packet to MAC ${macAddr}...`);
    try {
      const res = await runWol({ mac: macAddr });
      setLastExecutionStatus(res.success);
      setConsoleOutput(res.output);
    } catch (err) {
      setLastExecutionStatus(false);
      setConsoleOutput(`[Error] ${err.message || "Failed to transmit magic packet."}`);
    }
  };

  const historyList = historyData?.history || [];

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      {/* Page Header */}
      <PageHeader
        breadcrumb="INFRAGUARD / ENGINEER WORKSPACE"
        title="Engineer Diagnostic Workspace"
        subtitle="Centralized, zero-context-switching diagnostic suite for direct network asset execution."
      />

      {/* Quick Launch & Copy Row */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              display: "block",
              mb: 1,
            }}
          >
            Quick Target Operations
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon fontSize="small" />}
              onClick={() => handleCopy(targetIp)}
              sx={{ borderRadius: 2 }}
            >
              {copiedText === targetIp
                ? "Copied Target IP!"
                : `Copy Target IP (${targetIp})`}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ComputerIcon fontSize="small" />}
              component="a"
              href={`ssh://${targetIp}`}
              sx={{ borderRadius: 2 }}
            >
              Launch SSH Client
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ComputerIcon fontSize="small" />}
              component="a"
              href={`rdp://${targetIp}`}
              sx={{ borderRadius: 2 }}
            >
              Launch RDP Client
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Workspace Layout: Tool Forms + Interactive Console Stream */}
      <Grid container spacing={3}>
        {/* Left: Tool Selection & Controls */}
        <Grid item xs={12} md={5}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
                  variant="fullWidth"
                >
                  <Tab
                    icon={<SpeedIcon fontSize="small" />}
                    label="Ping"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                  <Tab
                    icon={<TerminalIcon fontSize="small" />}
                    label="Port"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                  <Tab
                    icon={<LanguageIcon fontSize="small" />}
                    label="DNS"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                  <Tab
                    icon={<PowerSettingsNewIcon fontSize="small" />}
                    label="WOL"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                </Tabs>
              </Box>

              {/* Tab 0: Ping Tool */}
              {activeTab === 0 && (
                <Box
                  component="form"
                  onSubmit={handlePingSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Execute ICMP echo request probe to verify network reachability and
                    measure round-trip RTT.
                  </Typography>
                  <TextField
                    label="Target IP Address"
                    size="small"
                    value={targetIp}
                    onChange={(e) => setTargetIp(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Packet Count"
                    type="number"
                    size="small"
                    value={pingCount}
                    onChange={(e) => setPingCount(e.target.value)}
                    inputProps={{ min: 1, max: 10 }}
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={isPingLoading}
                    sx={{ py: 1, borderRadius: 2, fontWeight: 600 }}
                  >
                    {isPingLoading ? "Pinging Target..." : "Execute Ping"}
                  </Button>
                </Box>
              )}

              {/* Tab 1: Port Check */}
              {activeTab === 1 && (
                <Box
                  component="form"
                  onSubmit={handlePortSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Test TCP socket connection on HTTP (80), HTTPS (443), SSH (22), RDP
                    (3389) or custom ports.
                  </Typography>
                  <TextField
                    label="Target IP Address"
                    size="small"
                    value={targetIp}
                    onChange={(e) => setTargetIp(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="TCP Port Number"
                    type="number"
                    size="small"
                    value={portNum}
                    onChange={(e) => setPortNum(e.target.value)}
                    required
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={isPortCheckLoading}
                    sx={{ py: 1, borderRadius: 2, fontWeight: 600 }}
                  >
                    {isPortCheckLoading ? "Testing Socket..." : "Check TCP Port"}
                  </Button>
                </Box>
              )}

              {/* Tab 2: DNS Lookup */}
              {activeTab === 2 && (
                <Box
                  component="form"
                  onSubmit={handleDnsSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Perform forward name resolution or reverse IP DNS PTR lookup.
                  </Typography>
                  <TextField
                    label="Hostname or IP Address"
                    size="small"
                    value={dnsQuery}
                    onChange={(e) => setDnsQuery(e.target.value)}
                    required
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={isDnsLoading}
                    sx={{ py: 1, borderRadius: 2, fontWeight: 600 }}
                  >
                    {isDnsLoading ? "Resolving..." : "Resolve DNS Query"}
                  </Button>
                </Box>
              )}

              {/* Tab 3: Wake-on-LAN */}
              {activeTab === 3 && (
                <Box
                  component="form"
                  onSubmit={handleWolSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Transmit UDP magic packet broadcast to power on sleeping devices.
                  </Typography>
                  <TextField
                    label="Target MAC Address"
                    size="small"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={macAddr}
                    onChange={(e) => setMacAddr(e.target.value)}
                    required
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<PowerSettingsNewIcon />}
                    disabled={isWolLoading}
                    sx={{ py: 1, borderRadius: 2, fontWeight: 600 }}
                  >
                    {isWolLoading ? "Transmitting..." : "Send Magic Packet"}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Live Interactive Terminal Console Stream */}
        <Grid item xs={12} md={7}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              height: "100%",
              bgcolor: "#0F172A",
              color: "#F8FAFC",
            }}
          >
            <CardContent
              sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TerminalIcon sx={{ color: "#38BDF8" }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "#FFFFFF" }}
                  >
                    Interactive Terminal Output
                  </Typography>
                </Box>
                {lastExecutionStatus !== null && (
                  <Chip
                    icon={
                      lastExecutionStatus ? (
                        <CheckCircleIcon style={{ color: "#10B981" }} />
                      ) : (
                        <CancelIcon style={{ color: "#EF4444" }} />
                      )
                    }
                    label={lastExecutionStatus ? "SUCCESS" : "FAILED"}
                    size="small"
                    sx={{
                      bgcolor: lastExecutionStatus
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                      color: lastExecutionStatus ? "#34D399" : "#F87171",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  />
                )}
              </Box>

              <Paper
                variant="outlined"
                className="font-mono"
                sx={{
                  p: 2,
                  bgcolor: "#020617",
                  borderColor: "#1E293B",
                  color: "#38BDF8",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  flexGrow: 1,
                  minHeight: 260,
                  overflowY: "auto",
                  borderRadius: 2,
                }}
              >
                {consoleOutput}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Terminal History Stream */}
      <Box sx={{ mt: 4 }}>
        <SectionHeader
          title="Terminal Execution Audit Log"
          description="Persistent record of diagnostic commands executed through the InfraGuard Engineer Workspace."
        />

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 3, mt: 2 }}
        >
          <Table size="small" aria-label="Terminal History">
            <TableHead>
              <TableRow>
                <TableCell>Tool</TableCell>
                <TableCell>Command</TableCell>
                <TableCell align="right">Latency</TableCell>
                <TableCell>Executed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    No terminal commands executed yet.
                  </TableCell>
                </TableRow>
              ) : (
                historyList.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Chip
                        label={item.tool_name}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell
                      className="font-mono"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {item.command_str}
                    </TableCell>
                    <TableCell align="right" className="font-mono">
                      {item.duration_ms} ms
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                      {new Date(item.executed_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
