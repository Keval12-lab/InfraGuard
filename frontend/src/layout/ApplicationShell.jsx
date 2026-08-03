import { useState } from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NavLink, Outlet, useLocation } from "react-router-dom";

// Icons

import { navigationItems } from "../config/navigation";

const drawerWidth = 248;

function SidebarContent({ onNavigate, onOpenAbout }) {
  return (
    <Box className="sidebar-content">
      <Toolbar className="brand-bar">
        <ShieldOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" className="brand-title">
              InfraGuard
            </Typography>
            <Chip
              label="v1.0"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, borderRadius: 1 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Infrastructure Visibility
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List className="nav-list" sx={{ flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <ListItemButton
                key={item.label}
                disabled
                sx={{
                  opacity: 0.55,
                  cursor: "not-allowed",
                  py: 1.2,
                  borderRadius: 2,
                  mb: 0.5,
                }}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                />
                <Chip
                  label="Soon"
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: "0.6rem", fontWeight: 600, ml: 1 }}
                />
              </ListItemButton>
            );
          }

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === "/"}
              onClick={onNavigate}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              sx={{ borderRadius: 2, mb: 0.5, py: 1 }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Divider />
      <Box sx={{ p: 2, bgcolor: "#F8FAFC" }}>
        <Button
          fullWidth
          size="small"
          variant="text"
          startIcon={<InfoOutlinedIcon fontSize="small" />}
          onClick={onOpenAbout}
          sx={{
            color: "text.secondary",
            justifyContent: "flex-start",
            fontSize: "0.78rem",
            py: 0.8,
          }}
        >
          About InfraGuard
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
        >
          Engine: Active • SQLite Local Storage
        </Typography>
      </Box>
    </Box>
  );
}

export default function ApplicationShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const location = useLocation();
  const currentPage =
    navigationItems.find((item) => item.path === location.pathname) ?? navigationItems[0];

  return (
    <Box className="app-layout">
      <AppBar position="fixed" color="inherit" elevation={0} className="topbar">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              className="menu-button"
              aria-label="Open navigation"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {currentPage.label}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.8 }}
            >
              <Box
                className="pulse-live"
                sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Engine Active
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setAboutOpen(true)}
              aria-label="About InfraGuard"
            >
              <InfoOutlinedIcon fontSize="small" color="action" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Main navigation">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          className="mobile-drawer"
        >
          <SidebarContent
            onNavigate={() => setMobileOpen(false)}
            onOpenAbout={() => {
              setMobileOpen(false);
              setAboutOpen(true);
            }}
          />
        </Drawer>
        <Drawer variant="permanent" open className="desktop-drawer">
          <SidebarContent onOpenAbout={() => setAboutOpen(true)} />
        </Drawer>
      </Box>

      <Box component="main" className="main-content">
        <Toolbar />
        <Outlet />
      </Box>

      {/* About Dialog */}
      <Dialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 1, display: "flex", alignItems: "center", gap: 1 }}
        >
          <ShieldOutlinedIcon color="primary" /> About InfraGuard
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            InfraGuard Enterprise Visibility Engine
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Version 1.0 Release Candidate
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            A unified IT infrastructure & network visibility platform providing real-time
            device discovery, continuous health monitoring, rule-based intelligence, and
            enterprise reporting.
          </Typography>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: 2,
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                fontWeight: 600,
                color: "success.main",
              }}
            >
              <CheckCircleIcon fontSize="inherit" /> Backend Engine: SQLite WAL Storage
              Active
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAboutOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export { drawerWidth };
