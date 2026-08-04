import React, { useState } from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import RadarIcon from "@mui/icons-material/Radar";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Icons

// Components & Hooks
import PageHeader from "../components/common/PageHeader";
import { useTimeline, useCreateTimelineEvent } from "../hooks/useTimeline";

export default function TimelinePage() {
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Note Form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");

  const {
    data: timelineData,
    isLoading,
    refetch,
  } = useTimeline({
    event_type: eventTypeFilter,
    severity: severityFilter,
  });

  const { mutateAsync: addNote, isPending: isAddingNote } = useCreateTimelineEvent();

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteTitle) return;
    try {
      await addNote({
        event_type: "NOTE",
        severity: "INFO",
        title: noteTitle,
        description: noteDesc,
      });
      setNoteTitle("");
      setNoteDesc("");
      setIsNoteModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to record timeline note:", err);
    }
  };

  const events = timelineData?.events || [];

  const getSeverityChip = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <Chip
            icon={<ErrorIcon />}
            label="CRITICAL"
            color="error"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      case "WARNING":
        return (
          <Chip
            icon={<WarningAmberIcon />}
            label="WARNING"
            color="warning"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      case "SUCCESS":
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="SUCCESS"
            color="success"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      default:
        return (
          <Chip
            icon={<InfoIcon />}
            label="INFO"
            color="info"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "DISCOVERY":
        return <RadarIcon sx={{ color: "#0284C7" }} />;
      case "MONITORING":
        return <MonitorHeartIcon sx={{ color: "#10B981" }} />;
      case "WORKSPACE":
        return <TerminalIcon sx={{ color: "#F59E0B" }} />;
      default:
        return <HistoryIcon sx={{ color: "#64748B" }} />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      {/* Page Header */}
      <PageHeader
        breadcrumb="INFRAGUARD / NETWORK TIMELINE"
        title="Network Health Timeline & Story Stream"
        subtitle="Chronological event story tracking health shifts, root-cause correlations, and recovery events."
        action={
          <Button
            variant="contained"
            startIcon={<NoteAddIcon />}
            onClick={() => setIsNoteModalOpen(true)}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            Add Engineer Note
          </Button>
        }
      />

      {/* ──── SECTION 1: Daily Network Summary Bar ──── */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3, borderColor: "divider", bgcolor: "background.paper" }}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              TODAY'S SLA METRICS
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>
              94% Network Health
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label="28 Online" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
            <Chip label="3 Attention" color="warning" variant="outlined" sx={{ fontWeight: 700 }} />
            <Chip label="1 Offline" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
            <Chip label="2 Recovered" color="info" variant="outlined" sx={{ fontWeight: 700 }} />
            <Chip label="18ms Avg Latency ▁▁▂▂▃▃" color="default" variant="outlined" sx={{ fontWeight: 700, fontFamily: "monospace" }} />
          </Stack>
        </Stack>
      </Paper>

      {/* ──── SECTION 2: Root Cause Correlation Card ──── */}
      <Card variant="outlined" sx={{ mb: 3.5, borderRadius: 3, borderLeft: "5px solid", borderLeftColor: "error.main", bgcolor: "rgba(239, 68, 68, 0.04)" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Chip label="Root Cause Correlation" color="error" size="small" sx={{ fontWeight: 800, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Possible Root Cause: Gateway Unreachable (192.168.1.1)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Uplink packet loss on primary gateway causing cascade timeouts across downstream assets.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip label="Affected: 17 Devices" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                <Chip label="2 Printers" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                <Chip label="1 Synology NAS" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                <Chip label="Impact: Finance & HR Dept" size="small" color="warning" sx={{ fontWeight: 700 }} />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Paper
        variant="outlined"
        sx={{ p: 2.5, mb: 3, borderRadius: 3, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Event Category</InputLabel>
            <Select
              value={eventTypeFilter}
              label="Event Category"
              onChange={(e) => setEventTypeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Event Categories</MenuItem>
              <MenuItem value="DISCOVERY">Discovery Scans</MenuItem>
              <MenuItem value="MONITORING">Monitoring Alerts</MenuItem>
              <MenuItem value="WORKSPACE">Workspace Tools</MenuItem>
              <MenuItem value="NOTE">Engineer Notes</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Severities</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </Select>
          </FormControl>

          <Chip
            label={`${events.length} Recorded Events`}
            variant="outlined"
            sx={{ fontWeight: 600, ml: "auto" }}
          />
        </Stack>
      </Paper>

      {/* Timeline Event Stream */}
      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        </Stack>
      ) : events.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <HistoryIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No timeline events match the selected filters.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Events are generated automatically during network discovery, status changes,
            and engineer commands.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {events.map((ev) => (
            <Card
              key={ev.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {getEventIcon(ev.event_type)}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {ev.title}
                    </Typography>
                    {getSeverityChip(ev.severity)}
                  </Stack>

                  <Typography
                    variant="caption"
                    className="font-mono"
                    color="text.secondary"
                  >
                    {new Date(ev.created_at).toLocaleString()}
                  </Typography>
                </Box>

                {ev.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5, pl: 4.5 }}
                  >
                    {ev.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={2} sx={{ pl: 4.5 }} alignItems="center">
                  <Chip
                    label={`Category: ${ev.event_type}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                  {ev.ip_address && (
                    <Typography
                      variant="caption"
                      className="font-mono"
                      color="primary.main"
                      sx={{ fontWeight: 600 }}
                    >
                      Target: {ev.ip_address} {ev.hostname ? `(${ev.hostname})` : ""}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Modal: Add Manual Engineer Note */}
      <Dialog
        open={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Record Manual Engineer Note</DialogTitle>
        <Box component="form" onSubmit={handleAddNoteSubmit}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Attach an operational audit note to the timeline stream (e.g. maintenance
              work, cable swap, vendor call).
            </Typography>
            <TextField
              label="Note Title"
              placeholder="e.g. Swapped patch cable on Core Switch Port 12"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Detailed Note Description"
              placeholder="Record operational details, tickets, or technician observations..."
              value={noteDesc}
              onChange={(e) => setNoteDesc(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isAddingNote || !noteTitle}
              sx={{ fontWeight: 600 }}
            >
              {isAddingNote ? "Recording..." : "Save Event Note"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
