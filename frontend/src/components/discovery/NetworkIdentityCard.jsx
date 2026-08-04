import React, { useState } from "react";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import SectionHeader from "../common/SectionHeader";
import StatusChip from "../common/StatusChip";

const CopyableField = ({ label, value, onCopy }) => {
  const handleCopy = () => {
    if (value && value !== "Not Detected") {
      navigator.clipboard.writeText(value);
      if (onCopy) onCopy(label);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.2,
        borderBottom: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
          {value || "Not Detected"}
        </Typography>
        <Tooltip title="Copy to clipboard">
          <IconButton
            size="small"
            onClick={handleCopy}
            disabled={!value || value === "Not Detected"}
            sx={{ p: 0.5 }}
          >
            <ContentCopyIcon fontSize="small" sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default function NetworkIdentityCard({ data, isLoading, onRefresh, isRefetching }) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [toastOpen, setToastOpen] = useState(false);

  const handleCopySuccess = (label) => {
    setToastMessage(`${label} copied to clipboard`);
    setToastSeverity("success");
    setToastOpen(true);
  };

  const handleRefresh = async () => {
    try {
      if (onRefresh) {
        await onRefresh();
        setToastMessage("Network Identity updated");
        setToastSeverity("success");
        setToastOpen(true);
      }
    } catch (err) {
      setToastMessage("Failed to refresh Network Identity");
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <SectionHeader
              title="Network Identity"
              description="Detected system & network context."
            />
            <Tooltip title="Refresh Identity">
              <IconButton
                onClick={handleRefresh}
                disabled={isLoading || isRefetching}
                size="small"
                color="primary"
                sx={{ bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
              >
                <RefreshIcon fontSize="small" sx={{ animation: isRefetching ? "spin 1s linear infinite" : "none" }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 1.2 }}>
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="40%" height={24} />
                  </Box>
                ))}
              </>
            ) : (
              <>
                <CopyableField label="Hostname" value={data?.hostname} onCopy={handleCopySuccess} />
                <CopyableField label="User" value={data?.current_user} onCopy={handleCopySuccess} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.2,
                    borderBottom: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    OS:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data?.os_name || "Unknown"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.2,
                    borderBottom: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Interface:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data?.interface_name || "Unknown"} ({data?.interface_type || "N/A"})
                  </Typography>
                </Box>
                <CopyableField label="MAC Address" value={data?.mac_address} onCopy={handleCopySuccess} />
                <CopyableField label="Local IP" value={data?.local_ip} onCopy={handleCopySuccess} />
                <CopyableField label="Gateway" value={data?.default_gateway} onCopy={handleCopySuccess} />
                <CopyableField label="Public IP" value={data?.public_ip} onCopy={handleCopySuccess} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.2,
                    borderBottom: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ISP:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data?.isp || "Not Detected"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Internet:
                  </Typography>
                  <StatusChip
                    status={data?.internet_connected ? "HEALTHY" : "OFFLINE"}
                    label={data?.internet_connected ? "Connected" : "Disconnected"}
                  />
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
