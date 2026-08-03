import React, { useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Icons

import PageHeader from "../components/common/PageHeader";
import {
  useAutomations,
  useAutomationRuns,
  useRunAutomation,
} from "../hooks/useAutomations";

export default function AutomationsPage() {
  const { data: automationsList, isLoading: isTemplatesLoading } = useAutomations();
  const { data: runsList, isLoading: isHistoryLoading } = useAutomationRuns();
  const { mutateAsync: triggerRun, isPending: isStarting } = useRunAutomation();

  const [expandedRunId, setExpandedRunId] = useState(null);

  const handleTrigger = async (autoId) => {
    try {
      await triggerRun(autoId);
    } catch (err) {
      console.error("Failed to trigger automation:", err);
    }
  };

  const toggleExpand = (runId) => {
    setExpandedRunId(expandedRunId === runId ? null : runId);
  };

  const automations = automationsList || [];
  const runs = runsList || [];

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      <PageHeader
        breadcrumb="INFRAGUARD / AUTOMATION ENGINE"
        title="Infrastructure Automation"
        subtitle="Schedule or manually run multi-step diagnostics, sweeps, and configuration check sequences."
      />

      <Grid container spacing={3}>
        {/* Left Side: Automation Templates */}
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Active Automation Templates
          </Typography>

          <Stack spacing={2.5}>
            {automations.map((auto) => (
              <Card key={auto.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="start"
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {auto.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {auto.description}
                      </Typography>
                    </Box>
                    <Chip
                      icon={
                        auto.trigger_type === "SCHEDULED" ? (
                          <ScheduleIcon fontSize="small" />
                        ) : (
                          <BoltIcon fontSize="small" />
                        )
                      }
                      label={
                        auto.trigger_type === "SCHEDULED"
                          ? `Scheduled (${auto.cron_expression})`
                          : "Manual Run"
                      }
                      size="small"
                      variant="outlined"
                      color={auto.trigger_type === "SCHEDULED" ? "primary" : "secondary"}
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block", mb: 1 }}
                    >
                      AUTOMATION SEQUENCE:
                    </Typography>
                    <Stack spacing={1}>
                      {auto.tasks &&
                        auto.tasks.map((task, idx) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              bgcolor: "rgba(0,0,0,0.01)",
                              borderRadius: 2,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {task.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Type: {task.type.toUpperCase()} • Target:{" "}
                                {task.target || "Auto Subnet"}
                              </Typography>
                            </Box>
                            <Chip
                              label={`Step ${idx + 1}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: "0.68rem" }}
                            />
                          </Paper>
                        ))}
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={isStarting}
                    onClick={() => handleTrigger(auto.id)}
                    sx={{ borderRadius: 2.5, fontWeight: 600, textTransform: "none" }}
                  >
                    Trigger Automation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Right Side: Run Execution Logs */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Execution Logs & History
          </Typography>

          <Stack spacing={2}>
            {runs.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 3, textAlign: "center", borderRadius: 3 }}
              >
                <Typography variant="body2" color="text.secondary">
                  No automation sequences have been triggered yet.
                </Typography>
              </Paper>
            ) : (
              runs.map((run) => {
                const isExpanded = expandedRunId === run.id;
                const isRunning = run.status === "RUNNING";
                const isSuccess = run.status === "SUCCESS";

                return (
                  <Card
                    key={run.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderColor: isRunning ? "warning.main" : "divider",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box
                          onClick={() => toggleExpand(run.id)}
                          sx={{ cursor: "pointer", flexGrow: 1 }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {run.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Run #{run.id} •{" "}
                            {new Date(run.executed_at).toLocaleTimeString()} •{" "}
                            {run.duration_seconds}s
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {isRunning ? (
                            <Chip
                              icon={<RotateRightIcon className="animate-spin" />}
                              label="Running"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ) : isSuccess ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Success"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              icon={<ErrorIcon />}
                              label="Failed"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}

                          <IconButton size="small" onClick={() => toggleExpand(run.id)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Stack>
                      </Stack>

                      {isRunning && (
                        <LinearProgress
                          color="warning"
                          sx={{ mt: 1.5, height: 3, borderRadius: 1 }}
                        />
                      )}

                      <Collapse
                        in={isExpanded}
                        timeout="auto"
                        unmountOnExit
                        sx={{ mt: 2 }}
                      >
                        <Stack spacing={1.5}>
                          {run.results &&
                            run.results.map((res, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  bgcolor: "rgba(0,0,0,0.02)",
                                  borderRadius: 2,
                                  borderLeft: "4px solid",
                                  borderLeftColor: res.success
                                    ? "success.main"
                                    : "error.main",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ mb: 1 }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                                  >
                                    {res.label}
                                  </Typography>
                                  <Chip
                                    label={res.success ? "Passed" : "Failed"}
                                    size="small"
                                    color={res.success ? "success" : "error"}
                                    sx={{
                                      height: 18,
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                    }}
                                  />
                                </Stack>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  className="font-mono"
                                  sx={{ display: "block", mb: 0.5 }}
                                >
                                  Target: {res.target} •{" "}
                                  {new Date(res.timestamp).toLocaleTimeString()}
                                </Typography>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 1.2,
                                    bgcolor: "#0F172A",
                                    color: "#E2E8F0",
                                    borderRadius: 1.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    className="font-mono"
                                    sx={{ whiteSpace: "pre-wrap", fontSize: "0.78rem" }}
                                  >
                                    {res.output}
                                  </Typography>
                                </Paper>
                              </Box>
                            ))}
                        </Stack>
                      </Collapse>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
