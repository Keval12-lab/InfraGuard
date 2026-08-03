import React, { useState } from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import SettingsIcon from "@mui/icons-material/Settings";
import TerminalIcon from "@mui/icons-material/Terminal";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Icons

// Shared hooks & elements
import PageHeader from "../components/common/PageHeader";
import useAssets from "../hooks/useAssets";
import {
  useRunbooks,
  useRunbookHistory,
  useStartRunbook,
  useAdvanceRunbookStep,
} from "../hooks/useRunbooks";

export default function RunbooksPage() {
  const { data: runbooksList, isLoading: isTemplatesLoading } = useRunbooks();
  const {
    data: historyList,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useRunbookHistory();
  const { data: devicesList } = useAssets();

  const { mutateAsync: startExecution } = useStartRunbook();
  const { mutateAsync: advanceStep, isPending: isAdvancing } = useAdvanceRunbookStep();

  // Active Session State
  const [activeSession, setActiveSession] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [engineerNotes, setEngineerNotes] = useState("");

  const handleStartSession = async (runbookId) => {
    try {
      const sess = await startExecution({
        runbook_id: runbookId,
        device_id: selectedDevice ? parseInt(selectedDevice) : null,
      });
      // Parse list objects
      setActiveSession(sess);
      setEngineerNotes("");
      refetchHistory();
    } catch (err) {
      console.error("Failed to start troubleshooter runbook:", err);
    }
  };

  const handleAdvanceStep = async (choiceIndex) => {
    if (!activeSession) return;
    try {
      const updated = await advanceStep({
        execId: activeSession.id,
        choice_index: choiceIndex,
        notes: engineerNotes,
      });
      setActiveSession(updated);
      setEngineerNotes("");
      refetchHistory();
    } catch (err) {
      console.error("Failed to advance troubleshooter step:", err);
    }
  };

  const handleResetSession = () => {
    setActiveSession(null);
  };

  const runbooks = runbooksList || [];
  const history = historyList || [];
  const devices = devicesList || [];

  const currentStep = activeSession
    ? activeSession.steps.find((s) => s.step_index === activeSession.current_step_index)
    : null;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      <PageHeader
        breadcrumb="INFRAGUARD / DIAGNOSTIC RUNBOOKS"
        title="Interactive Troubleshooting Engine"
        subtitle="Automated, step-by-step decision trees integrated directly with living asset history and network tools."
      />

      <Grid container spacing={3}>
        {/* Left Side: Active Troubleshooter Wizard */}
        <Grid item xs={12} md={8}>
          {activeSession ? (
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, border: "2px solid", borderColor: "primary.main" }}
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
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Active Troubleshooting: {activeSession.name}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<ReplayIcon />}
                    onClick={handleResetSession}
                    sx={{ fontWeight: 600 }}
                  >
                    Reset Troubleshooter
                  </Button>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={
                    activeSession.status === "COMPLETED"
                      ? 100
                      : Math.min(
                          ((activeSession.current_step_index + 1) /
                            activeSession.steps.length) *
                            100,
                          95
                        )
                  }
                  sx={{ height: 6, borderRadius: 2, mb: 3 }}
                />

                {currentStep ? (
                  <Box>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        mb: 3,
                        bgcolor: "rgba(30,41,59,0.02)",
                        borderRadius: 2.5,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                        {currentStep.question}
                      </Typography>
                      {currentStep.instructions && (
                        <Typography variant="body2" color="text.secondary">
                          {currentStep.instructions}
                        </Typography>
                      )}
                    </Paper>

                    {/* Step Options / Choice Buttons */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      {currentStep.choices && currentStep.choices.length > 0 ? (
                        currentStep.choices.map((choice, idx) => (
                          <Button
                            key={idx}
                            variant="outlined"
                            fullWidth
                            size="large"
                            onClick={() => handleAdvanceStep(idx)}
                            disabled={isAdvancing}
                            endIcon={<NavigateNextIcon />}
                            sx={{
                              justifyContent: "space-between",
                              p: 2,
                              borderRadius: 2.5,
                              textTransform: "none",
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "primary.main",
                                color: "white",
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            {choice.label}
                          </Button>
                        ))
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            textAlign: "center",
                            borderColor: "success.main",
                            bgcolor: "rgba(16,185,129,0.02)",
                          }}
                        >
                          <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: "success.main" }}
                          >
                            Troubleshooting Session Complete
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Workflow successfully resolved. Audit log has been registered
                            to the unified Timeline.
                          </Typography>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleResetSession}
                            sx={{ mt: 2, borderRadius: 2 }}
                          >
                            Done
                          </Button>
                        </Paper>
                      )}
                    </Stack>

                    {/* Optional Engineer Note Entry */}
                    {currentStep.choices && currentStep.choices.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          label="Add Technician Audit Note (Optional)"
                          placeholder="e.g. Cables look secure, port LED is orange."
                          size="small"
                          value={engineerNotes}
                          onChange={(e) => setEngineerNotes(e.target.value)}
                          fullWidth
                        />
                      </Box>
                    )}

                    {/* Live Console Output for Background Workspace Tools */}
                    {activeSession.logs && activeSession.logs.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: "block", mb: 1 }}
                        >
                          WIZARD DIAGNOSTIC CONSOLE
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: "#0F172A",
                            color: "#38BDF8",
                            borderRadius: 2.5,
                            maxHeight: 250,
                            overflowY: "auto",
                          }}
                        >
                          {activeSession.logs.map((log, idx) => (
                            <Box key={idx} sx={{ mb: 1.5 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                className="font-mono"
                                sx={{ display: "block" }}
                              >
                                [{new Date(log.timestamp).toLocaleTimeString()}] (
                                {log.type})
                              </Typography>
                              <Typography
                                variant="body2"
                                className="font-mono"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  color:
                                    log.type === "auto_tool_result"
                                      ? "#10B981"
                                      : "#F8FAFC",
                                }}
                              >
                                {log.message}
                              </Typography>
                            </Box>
                          ))}
                        </Paper>
                      </Box>
                    )}
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: "center" }}>
              <SettingsIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Select Troubleshooting Runbook
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose an interactive troubleshooter workflow template from the list on
                the right.
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2.5, maxWidth: 450, mx: "auto", borderRadius: 2.5 }}
              >
                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Optional: Select Target Device Context</InputLabel>
                  <Select
                    value={selectedDevice}
                    label="Optional: Select Target Device Context"
                    onChange={(e) => setSelectedDevice(e.target.value)}
                  >
                    <MenuItem value="">
                      -- No Device context (Manual IP input) --
                    </MenuItem>
                    {devices.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.ip_address} {d.hostname ? `(${d.hostname})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary">
                  If selected, diagnostic tools will target this device automatically.
                </Typography>
              </Paper>
            </Card>
          )}

          {/* Execution History */}
          <Card variant="outlined" sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Runbook Execution Log
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No troubleshooter runbooks have been executed yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {history.map((h) => (
                    <Paper key={h.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {h.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Session #{h.id} • Target: {h.ip_address || "None"} • Duration:{" "}
                            {h.duration_seconds}s
                          </Typography>
                        </Box>
                        <Chip
                          label={h.status}
                          size="small"
                          color={h.status === "COMPLETED" ? "success" : "warning"}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Troubleshooter Templates */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Troubleshooter Templates
          </Typography>
          <Stack spacing={2.5}>
            {runbooks.map((book) => (
              <Card key={book.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    {book.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {book.description}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={Boolean(activeSession)}
                    onClick={() => handleStartSession(book.id)}
                    fullWidth
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Launch troubleshooter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
