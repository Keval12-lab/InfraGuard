import React, { lazy, Suspense } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";

import { QueryProvider } from "./contexts/QueryProvider";
import ApplicationShell from "./layout/ApplicationShell";
import { appTheme } from "./theme/appTheme";

// Lazy loaded page components
const AssetsPage = lazy(() => import("./pages/AssetsPage"));
const AutomationsPage = lazy(() => import("./pages/AutomationsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DiscoveryPage = lazy(() => import("./pages/DiscoveryPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const RunbooksPage = lazy(() => import("./pages/RunbooksPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const TopologyPage = lazy(() => import("./pages/TopologyPage"));
const WorkspacePage = lazy(() => import("./pages/WorkspacePage"));

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontFamily: "sans-serif",
                color: "#6b7280",
              }}
            >
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route element={<ApplicationShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/runbooks" element={<RunbooksPage />} />
              <Route path="/automations" element={<AutomationsPage />} />
              <Route path="/network" element={<TopologyPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </QueryProvider>
  );
}
