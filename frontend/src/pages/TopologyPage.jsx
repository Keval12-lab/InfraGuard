import React, { useState, useMemo, useRef } from "react";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";
import FilterCenterFocusIcon from "@mui/icons-material/FilterCenterFocus";
import PrintIcon from "@mui/icons-material/Print";
import PublicIcon from "@mui/icons-material/Public";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RouterIcon from "@mui/icons-material/Router";
import SearchIcon from "@mui/icons-material/Search";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsInputHdmiIcon from "@mui/icons-material/SettingsInputHdmi";
import StorageIcon from "@mui/icons-material/Storage";

// Icons
import SyncIcon from "@mui/icons-material/Sync";
import TerminalIcon from "@mui/icons-material/Terminal";
import VerifiedIcon from "@mui/icons-material/Verified";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Dialog Modals
import { useNavigate } from "react-router-dom";

import InfrastructurePassportDialog from "../components/assets/InfrastructurePassportDialog";
import SnmpInspectorDialog from "../components/assets/SnmpInspectorDialog";
import PageHeader from "../components/common/PageHeader";
import { useTopologyInteraction } from "../components/topology/hooks/useTopologyInteraction";
import { useTopologySelection } from "../components/topology/hooks/useTopologySelection";
import { useViewport } from "../components/topology/hooks/useViewport";
import { useTopology } from "../hooks/useTopology";

export default function TopologyPage() {
  const navigate = useNavigate();
  const {
    data: topoData,
    isLoading: isTopologyLoading,
    refetch,
    isRefetching,
  } = useTopology();

  const [searchQuery, setSearchQuery] = useState("");
  const {
    selectedNode,
    setSelectedNode,
    activePassportId,
    setActivePassportId,
    activeSnmpId,
    setActiveSnmpId,
  } = useTopologySelection();

  const svgRef = useRef(null);

  // Viewport zoom & pan hook
  const { state: viewportState, actions: viewportActions } = useViewport();
  const { zoom, pan, isPanning } = viewportState;

  // Interaction (dragging, tooltips) hook
  const { state: interactionState, actions: interactionActions } = useTopologyInteraction(
    {
      svgRef,
      viewportState,
    }
  );
  const { hoveredNode, tooltipPos, nodePositions } = interactionState;
  const { setNodePositions } = interactionActions;

  // Initialize and persist node positions
  const { nodes, links } = useMemo(() => {
    if (!topoData) return { nodes: [], links: [] };

    const { devices = [], links: rawLinks = [] } = topoData;

    const initialNodes = [
      {
        id: "internet_wan",
        hostname: "Internet WAN",
        ip_address: "WAN Link",
        device_type: "WAN",
        status: "Healthy",
        vendor: "Provider",
        level: 0,
        cpu: "N/A",
        ram: "N/A",
        latency: "1 ms",
        uptime: "365 Days",
        defaultX: 600,
        defaultY: 50,
      },
    ];

    // Classify
    const routers = devices.filter(
      (d) =>
        d.device_type?.toLowerCase().includes("router") || d.ip_address?.endsWith(".1")
    );
    const switches = devices.filter(
      (d) =>
        d.device_type?.toLowerCase().includes("switch") ||
        d.hostname?.toLowerCase().includes("switch")
    );
    const endpoints = devices.filter(
      (d) => !routers.includes(d) && !switches.includes(d)
    );

    // Position Routers (Level 1)
    const center = 600;
    routers.forEach((r, idx) => {
      const totalWidth = (routers.length - 1) * 160;
      const startX = center - (totalWidth / 2);
      initialNodes.push({
        ...r,
        level: 1,
        cpu: "12%",
        ram: "34%",
        latency: "2 ms",
        uptime: "45 Days",
        defaultX: startX + idx * 160,
        defaultY: 150,
      });
    });

    // Core Switches (Level 2)
    switches.forEach((sw, idx) => {
      const switchCount = switches.length;
      const totalSwitchWidth = (switchCount - 1) * 160;
      const switchStartX = center - (totalSwitchWidth / 2);
      initialNodes.push({
        ...sw,
        level: 2,
        cpu: "25%",
        ram: "50%",
        latency: "2 ms",
        uptime: "90 Days",
        defaultX: switchStartX + idx * 160,
        defaultY: 260,
      });
    });

    // Endpoints (Level 3)
    endpoints.forEach((ep, idx) => {
      const maxPerRow = 7;
      const row = Math.floor(idx / maxPerRow);
      const col = idx % maxPerRow;
      const countInRow = Math.min(endpoints.length - row * maxPerRow, maxPerRow);
      const totalEpWidth = (countInRow - 1) * 140;
      const epStartX = center - (totalEpWidth / 2);
      
      initialNodes.push({
        ...ep,
        level: 3,
        cpu: ep.status === "Offline" ? "0%" : "8%",
        ram: ep.status === "Offline" ? "0%" : "28%",
        latency: ep.status === "Offline" ? "Timed Out" : "4 ms",
        uptime: ep.status === "Offline" ? "0 Days" : "15 Days",
        defaultX: epStartX + col * 140,
        defaultY: 380 + row * 110,
      });
    });

    // Map final node array with dragged state or default
    const mappedNodes = initialNodes.map((n) => {
      const pos = nodePositions[n.id];
      return {
        ...n,
        x: pos ? pos.x : n.defaultX,
        y: pos ? pos.y : n.defaultY,
      };
    });

    // Establish links
    const calculatedLinks = [];
    const l1Routers = mappedNodes.filter((n) => n.level === 1);
    const l2Switches = mappedNodes.filter((n) => n.level === 2);
    const l3Endpoints = mappedNodes.filter((n) => n.level === 3);

    // WAN -> Routers
    l1Routers.forEach((r) => {
      calculatedLinks.push({
        id: `wan-${r.id}`,
        source: "internet_wan",
        target: r.id,
        linkType: "Trunk",
      });
    });

    // Routers -> Switches
    l1Routers.forEach((r) => {
      l2Switches.forEach((s) => {
        calculatedLinks.push({
          id: `${r.id}-${s.id}`,
          source: r.id,
          target: s.id,
          linkType: "Trunk",
        });
      });
    });

    // Switches or Routers -> Endpoints
    l3Endpoints.forEach((e) => {
      // Connect to switch if exists, otherwise fallback to router, otherwise WAN
      const parentNode = l2Switches.length > 0 
        ? l2Switches[0] 
        : (l1Routers[0] || { id: "internet_wan" });
        
      calculatedLinks.push({
        id: `${parentNode.id}-${e.id}`,
        source: parentNode.id,
        target: e.id,
        linkType: e.device_type?.toLowerCase().includes("wireless")
          ? "Wireless"
          : "Ethernet",
      });
    });

    // LLDP links
    rawLinks.forEach((rl) => {
      const targetNode = mappedNodes.find(
        (n) => n.hostname?.toLowerCase() === rl.neighbor_name?.toLowerCase()
      );
      if (targetNode) {
        calculatedLinks.push({
          id: `lldp-${rl.device_id}-${targetNode.id}`,
          source: rl.device_id,
          target: targetNode.id,
          label: rl.local_port,
          linkType: "Trunk",
          isLLDP: true,
        });
      }
    });

    return { nodes: mappedNodes, links: calculatedLinks };
  }, [topoData, nodePositions]);

  // Compute node category/status counts dynamically
  const counts = useMemo(() => {
    let routers = 0;
    let switches = 0;
    let servers = 0;
    let pcs = 0;
    let offline = 0;

    nodes.forEach((n) => {
      if (n.id === "internet_wan") return;
      if (n.status === "Offline") offline++;

      const type = n.device_type?.toLowerCase() || "";
      const host = n.hostname?.toLowerCase() || "";
      if (type.includes("router")) {
        routers++;
      } else if (type.includes("switch")) {
        switches++;
      } else if (type.includes("server") || host.includes("server")) {
        servers++;
      } else {
        pcs++;
      }
    });

    return { routers, switches, servers, pcs, offline };
  }, [nodes]);

  // Client-side SVG to PNG exporter
  const handleExportPNG = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 560;
        const context = canvas.getContext("2d");

        // Draw dark background to match application UI
        context.fillStyle = "#0B0F19";
        context.fillRect(0, 0, 1000, 560);

        context.drawImage(image, 0, 0);

        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = png;
        downloadLink.download = "infraguard_network_topology.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Failed to export PNG:", err);
    }
  };

  // Handle Search Highlights
  const highlightedNodeIds = useMemo(() => {
    if (!searchQuery) return [];
    return nodes
      .filter(
        (n) =>
          n.hostname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.ip_address?.includes(searchQuery)
      )
      .map((n) => n.id);
  }, [searchQuery, nodes]);

  // Zoom & Pan Handlers
  const handleZoomIn = () => viewportActions.handleZoomIn();
  const handleZoomOut = () => viewportActions.handleZoomOut();
  const handleResetZoom = () => {
    viewportActions.handleResetZoom(() => {
      interactionActions.resetPositions();
    });
  };

  const handleMouseDown = (e) => {
    viewportActions.handleMouseDown(e);
  };

  const handleMouseMove = (e) => {
    if (viewportState.isPanning) {
      viewportActions.handleMouseMove(e);
    } else {
      interactionActions.handleMouseMove(e);
    }
  };

  const handleMouseUp = () => {
    if (viewportState.isPanning) {
      viewportActions.handleMouseUp();
    } else {
      interactionActions.handleMouseUp();
    }
  };

  const handleNodeMouseDown = (e, nodeId) => {
    interactionActions.handleNodeMouseDown(e, nodeId);
  };

  const handleNodeMouseEnter = (e, node) => {
    interactionActions.handleNodeMouseEnter(e, node);
  };

  const handleNodeMouseMove = (e) => {
    interactionActions.handleNodeMouseMove(e);
  };

  const handleNodeMouseLeave = () => {
    interactionActions.handleNodeMouseLeave();
  };

  // Node Icons (Enterprise Emoji System)
  const getDeviceIcon = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("wan")) return "🌐";
    if (t.includes("firewall")) return "🧱";
    if (t.includes("router") || t.includes("gateway")) return "📡";
    if (t.includes("switch")) return "🔀";
    if (t.includes("printer")) return "🖨️";
    if (t.includes("server") || t.includes("nas")) return "🗄️";
    if (t.includes("mobile") || t.includes("phone")) return "📱";
    if (t.includes("laptop")) return "💻";
    if (t.includes("unknown") || t.includes("not available")) return "❓";
    return "🖥️";
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "healthy";
    if (s === "warning") return "#F59E0B";
    if (s === "offline") return "#EF4444";
    return "#10B981";
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 6 }}>
      {/* Page Header and Actions */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 4 }}
      >
        <PageHeader
          breadcrumb="INFRAGUARD / TOPOLOGY ENGINE"
          title="Network Topology Canvas"
          subtitle="Zoom, pan, and drag nodes to custom configure maps. Live status colors, animated packet flow, and hover tooltips."
          sx={{ mb: 0 }}
        />

        {/* Actions Bar */}
        <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={
              isRefetching ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={() => refetch()}
            disabled={isTopologyLoading || isRefetching}
            sx={{
              bgcolor: "#111827",
              borderColor: "#374151",
              color: "#F9FAFB",
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#4B5563", bgcolor: "#1F2937" },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={() => setNodePositions({})}
            disabled={isTopologyLoading}
            sx={{
              bgcolor: "#111827",
              borderColor: "#374151",
              color: "#F9FAFB",
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#4B5563", bgcolor: "#1F2937" },
            }}
          >
            Auto Layout
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterCenterFocusIcon />}
            onClick={handleResetZoom}
            disabled={isTopologyLoading}
            sx={{
              bgcolor: "#111827",
              borderColor: "#374151",
              color: "#F9FAFB",
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#4B5563", bgcolor: "#1F2937" },
            }}
          >
            Fit View
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportPNG}
            disabled={isTopologyLoading}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Export PNG
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* Left Summary and Directory Panel */}
        <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 4,
              bgcolor: "#0B0F19",
              borderColor: "#374151",
              minHeight: 560,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "#F9FAFB", mb: 2 }}
            >
              Network Directory
            </Typography>

            {/* Counts grid */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    bgcolor: "#111827",
                    borderColor: "#1F2937",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#A855F7", fontWeight: 800 }}>
                    {counts.routers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Routers
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    bgcolor: "#111827",
                    borderColor: "#1F2937",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#3B82F6", fontWeight: 800 }}>
                    {counts.switches}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Switches
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    bgcolor: "#111827",
                    borderColor: "#1F2937",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#10B981", fontWeight: 800 }}>
                    {counts.servers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Servers
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    bgcolor: "#111827",
                    borderColor: "#1F2937",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#EF4444", fontWeight: 800 }}>
                    {counts.offline}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Offline
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2, borderColor: "#1F2937" }} />

            {/* Quick Search */}
            <TextField
              placeholder="Search devices..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mb: 2,
                bgcolor: "#111827",
                borderRadius: 2.5,
                input: { color: "#F9FAFB" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#374151" },
                  "&:hover fieldset": { borderColor: "#4B5563" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Device List */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 260 }}>
              <List sx={{ p: 0 }}>
                {nodes
                  .filter((n) => n.id !== "internet_wan")
                  .map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isHighlighted = highlightedNodeIds.includes(node.id);
                    const statusColor = getStatusColor(node.status);

                    return (
                      <ListItemButton
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          py: 0.75,
                          px: 1.5,
                          bgcolor: isSelected
                            ? "rgba(59, 130, 246, 0.15)"
                            : isHighlighted
                              ? "rgba(6, 182, 212, 0.08)"
                              : "transparent",
                          border: "1px solid",
                          borderColor: isSelected ? "#3B82F6" : "transparent",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.03)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: statusColor,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: "#F9FAFB" }}
                            >
                              {node.hostname}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{ color: "#9CA3AF", fontFamily: "monospace" }}
                            >
                              {node.ip_address}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    );
                  })}
              </List>
            </Box>
          </Paper>
        </Box>

        {/* Graph Canvas Column */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 0,
              borderRadius: 4,
              position: "relative",
              bgcolor: "#0B0F19",
              borderColor: "#374151",
              minHeight: 560,
              width: "100%",
              display: "block",
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {/* Zoom / Pan Controls Overlay */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
            >
              <Paper
                variant="outlined"
                sx={{
                  bgcolor: "#111827",
                  borderColor: "#374151",
                  p: 0.5,
                  borderRadius: 2.5,
                  display: "flex",
                }}
              >
                <IconButton size="small" onClick={handleZoomIn} sx={{ color: "#9CA3AF" }}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleZoomOut}
                  sx={{ color: "#9CA3AF" }}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleResetZoom}
                  sx={{ color: "#9CA3AF" }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Stack>

            {/* Custom Tooltip */}
            {hoveredNode && (
              <Box
                sx={{
                  position: "absolute",
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  bgcolor: "rgba(17, 24, 39, 0.95)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid",
                  borderColor: getStatusColor(hoveredNode.status),
                  borderRadius: 2,
                  p: 1.5,
                  zIndex: 100,
                  pointerEvents: "none",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff" }}>
                  {hoveredNode.hostname}
                </Typography>
                <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block" }}>
                  IP: {hoveredNode.ip_address} • Vendor: {hoveredNode.vendor}
                </Typography>
                <Divider sx={{ my: 1, borderColor: "#374151" }} />
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: "#E5E7EB" }}>
                    CPU: <span style={{ fontWeight: 700 }}>{hoveredNode.cpu}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#E5E7EB" }}>
                    RAM: <span style={{ fontWeight: 700 }}>{hoveredNode.ram}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#E5E7EB" }}>
                    Latency:{" "}
                    <span style={{ fontWeight: 700 }}>{hoveredNode.latency}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#E5E7EB" }}>
                    Uptime: <span style={{ fontWeight: 700 }}>{hoveredNode.uptime}</span>
                  </Typography>
                </Stack>
              </Box>
            )}

            {isTopologyLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 520,
                }}
              >
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <svg
                ref={svgRef}
                width="100%"
                height="560"
                viewBox="0 0 1200 650"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: isPanning ? "grabbing" : "grab", display: "block" }}
              >
                {/* Clickable Background for Pan */}
                <rect id="viewport-bg" width="100%" height="100%" fill="transparent" />

                {/* Transform group representing Zoom & Pan */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Link connections */}
                  {links.map((link) => {
                    const src = nodes.find((n) => n.id === link.source);
                    const tgt = nodes.find((n) => n.id === link.target);
                    if (!src || !tgt) return null;

                    let strokeColor = "#374151";
                    let strokeWidth = 1.5;
                    let strokeDash = "0";

                    if (link.linkType === "Trunk") {
                      strokeColor = "#A855F7"; // Trunk link
                      strokeWidth = 3;
                    } else if (link.linkType === "Wireless") {
                      strokeColor = "#38BDF8"; // Wireless link
                      strokeDash = "4,4";
                    }

                    // Smooth bezier connector path
                    const midY = (src.y + tgt.y) / 2;
                    const pathD = `M ${src.x} ${src.y} C ${src.x} ${midY}, ${tgt.x} ${midY}, ${tgt.x} ${tgt.y}`;

                    return (
                      <g key={link.id}>
                        <path
                          id={`link-${link.id}`}
                          data-source={link.source}
                          data-target={link.target}
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDash}
                        />
                        {/* Animated packet flow dot */}
                        {src.status !== "Offline" && tgt.status !== "Offline" && (
                          <circle r="3.5" fill="#10B981">
                            <animateMotion
                              path={pathD}
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Draw Nodes */}
                  {nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isHighlighted = highlightedNodeIds.includes(node.id);
                    const statusColor = getStatusColor(node.status);

                    return (
                      <g
                        key={node.id}
                        id={`node-${node.id}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onMouseEnter={(e) => handleNodeMouseEnter(e, node)}
                        onMouseMove={handleNodeMouseMove}
                        onMouseLeave={handleNodeMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (node.id !== "internet_wan") setSelectedNode(node);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Highlight Outer ring */}
                        {(isHighlighted || isSelected) && (
                          <circle
                            cy="-12"
                            r="28"
                            fill="none"
                            stroke={isSelected ? "#3B82F6" : "#06B6D4"}
                            strokeWidth="3.5"
                            style={{
                              filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))",
                            }}
                          />
                        )}

                        {/* Status Ring */}
                        <circle
                          cy="-12"
                          r="22"
                          fill="#111827"
                          stroke={statusColor}
                          strokeWidth="3"
                          style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}
                        />

                        {/* Emoji Icon */}
                        <text
                          y="-4"
                          textAnchor="middle"
                          fontSize="22"
                          style={{ pointerEvents: "none" }}
                        >
                          {getDeviceIcon(node.device_type || node.hostname)}
                        </text>

                        {/* Labels Box */}
                        <rect
                          x="-60"
                          y="18"
                          width="120"
                          height="52"
                          rx="6"
                          fill="rgba(17, 24, 39, 0.85)"
                          stroke="#374151"
                          strokeWidth="1"
                        />

                        {/* Text labels */}
                        <text
                          y="32"
                          textAnchor="middle"
                          fill="#F9FAFB"
                          fontSize="11"
                          fontWeight="700"
                          style={{ pointerEvents: "none" }}
                        >
                          {(node.hostname && node.hostname !== "Unknown" && node.hostname !== "Not Available")
                            ? (node.hostname.length > 18 ? node.hostname.substring(0, 15) + "..." : node.hostname)
                            : "Unknown Device"}
                        </text>

                        <text
                          y="46"
                          textAnchor="middle"
                          fill="#9CA3AF"
                          fontSize="10"
                          fontWeight="600"
                          style={{ pointerEvents: "none" }}
                        >
                          {node.ip_address}
                        </text>
                        
                        <text
                          y="60"
                          textAnchor="middle"
                          fill="#6B7280"
                          fontSize="9"
                          style={{ pointerEvents: "none" }}
                        >
                          {(node.device_type && node.device_type !== "Unknown" && node.device_type !== "Not Available")
                            ? (node.device_type.length > 20 ? node.device_type.substring(0, 18) + "..." : node.device_type)
                            : ((node.vendor && node.vendor !== "Unknown" && node.vendor !== "Not Available") ? node.vendor : "Vendor Unknown")}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* Legend Overlay at Bottom */}
            <Stack
              direction="row"
              spacing={3}
              justifyContent="center"
              alignItems="center"
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 10,
                p: 1.5,
                bgcolor: "rgba(17, 24, 39, 0.8)",
                backdropFilter: "blur(4px)",
                borderRadius: 3,
                border: "1px solid #374151",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#10B981" }}
                />
                <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600 }}>
                  Healthy
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#F59E0B" }}
                />
                <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600 }}>
                  Warning
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#EF4444" }}
                />
                <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600 }}>
                  Offline
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 24, height: 2, bgcolor: "#A855F7" }} />
                <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600 }}>
                  Trunk Link
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 24, height: 2, bgcolor: "#374151" }} />
                <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600 }}>
                  Ethernet Link
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 24, height: 2, borderBottom: "2px dashed #38BDF8" }} />
                <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600 }}>
                  Wireless Link
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {/* Slide-out Node Inspector Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        PaperProps={{
          sx: {
            width: 380,
            bgcolor: "#0B0F19",
            color: "#F9FAFB",
            p: 3,
            borderLeft: "1px solid #374151",
          },
        }}
      >
        {selectedNode && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Node Properties
              </Typography>
              <Chip
                label={selectedNode.status}
                size="small"
                sx={{
                  bgcolor: getStatusColor(selectedNode.status),
                  color: "#fff",
                  fontWeight: 700,
                }}
              />
            </Stack>

            <Card
              variant="outlined"
              sx={{
                bgcolor: "#111827",
                borderColor: "#374151",
                color: "#F9FAFB",
                mb: 3,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  HOSTNAME / IP ADDRESS
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  {selectedNode.hostname} ({selectedNode.ip_address})
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  VENDOR & HARDWARE TYPE
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedNode.vendor || "Unknown"} •{" "}
                  {selectedNode.device_type || "Unknown"}
                </Typography>

                <Divider sx={{ my: 1.5, borderColor: "#374151" }} />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, display: "block", mb: 1 }}
                >
                  METRICS AUDIT:
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        bgcolor: "#0B0F19",
                        borderColor: "#374151",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        CPU Load
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedNode.cpu}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        bgcolor: "#0B0F19",
                        borderColor: "#374151",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        RAM Use
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedNode.ram}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        bgcolor: "#0B0F19",
                        borderColor: "#374151",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Latency
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedNode.latency}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        bgcolor: "#0B0F19",
                        borderColor: "#374151",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Uptime
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedNode.uptime}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, display: "block", mb: 1.5 }}
            >
              ENTERPRISE TOOLS
            </Typography>

            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<VerifiedIcon />}
                onClick={() => setActivePassportId(selectedNode.id)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#F9FAFB",
                  borderColor: "#374151",
                }}
              >
                Open Infrastructure Passport
              </Button>

              <Button
                variant="outlined"
                fullWidth
                color="secondary"
                startIcon={<SyncIcon />}
                onClick={() => setActiveSnmpId(selectedNode.id)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Inspect SNMP Port Inventory
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<TerminalIcon />}
                onClick={() => navigate("/workspace")}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#F9FAFB",
                  borderColor: "#374151",
                }}
              >
                Launch Workspace Terminal
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Dialog Modals */}
      {activePassportId && (
        <InfrastructurePassportDialog
          open={Boolean(activePassportId)}
          onClose={() => setActivePassportId(null)}
          deviceId={activePassportId}
        />
      )}
      {activeSnmpId && (
        <SnmpInspectorDialog
          open={Boolean(activeSnmpId)}
          onClose={() => setActiveSnmpId(null)}
          deviceId={activeSnmpId}
        />
      )}
    </Box>
  );
}
