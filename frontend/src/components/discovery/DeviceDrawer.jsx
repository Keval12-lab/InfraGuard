import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import DnsIcon from "@mui/icons-material/Dns";
import RouterIcon from "@mui/icons-material/Router";
import MemoryIcon from "@mui/icons-material/Memory";
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import NotesIcon from "@mui/icons-material/Notes";

import IGStatusChip from "../ui/IGStatusChip";

export default function DeviceDrawer({ open, onClose, device }) {
  if (!device) return null;

  const isReachable = device.reachable !== false; // default true if undefined
  const status = isReachable ? "Healthy" : "Offline";
  const hostname = device.hostname && device.hostname !== "Not Available" ? device.hostname : "Unknown Host";
  const ip = device.ip_address;
  const mac = device.mac_address || "Not Discovered";
  const vendor = device.vendor && device.vendor !== "Local Host" ? device.vendor : "Unknown";
  const type = device.device_type || "Unknown";
  const os = device.os || "Unknown OS";
  const gateway = device.gateway || "Not Available";
  const latency = device.latency ? `${device.latency.toFixed(2)} ms` : "Unknown";

  const downloadReport = () => {
    // Placeholder for export functionality
    const blob = new Blob([JSON.stringify(device, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `device-${ip}.json`;
    a.click();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 400, md: 500 } } }}>
      <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Device Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ip}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "primary.50",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {type.toLowerCase().includes("router") ? (
                <RouterIcon />
              ) : type.toLowerCase().includes("switch") ? (
                <MemoryIcon />
              ) : (
                <ComputerIcon />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {hostname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vendor} • {type}
              </Typography>
            </Box>
          </Box>
          <IGStatusChip status={status} label={status} />
        </Box>

        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
              Network Identity
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">IP Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: "monospace" }}>{ip}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">MAC Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: "monospace" }}>{mac}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Gateway</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{gateway}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Latency</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{latency}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
              System Details
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Operating System</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{os}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Open Ports</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{device.open_ports?.length || "None Detected"}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
              Activity & Notes
            </Typography>
            <Stack spacing={2} sx={{ mt: 1.5 }}>
              <Button startIcon={<HistoryIcon />} variant="outlined" color="inherit" fullWidth sx={{ justifyContent: "flex-start", borderRadius: 2 }}>
                View Discovery Timeline
              </Button>
              <Button startIcon={<NotesIcon />} variant="outlined" color="inherit" fullWidth sx={{ justifyContent: "flex-start", borderRadius: 2 }}>
                Add Operational Notes
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ mt: "auto", p: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={downloadReport}
          sx={{ borderRadius: 2 }}
        >
          Export Device Report
        </Button>
      </Box>
    </Drawer>
  );
}
