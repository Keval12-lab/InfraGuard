import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { navigationItems } from "../config/navigation";

const drawerWidth = 248;

function SidebarContent({ onNavigate }) {
  return (
    <Box className="sidebar-content">
      <Toolbar className="brand-bar">
        <ShieldOutlinedIcon color="primary" />
        <Box>
          <Typography variant="h6" className="brand-title">InfraGuard</Typography>
          <Typography variant="caption" color="text.secondary">Infrastructure Visibility</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List className="nav-list">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === "/"}
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default function ApplicationShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentPage = navigationItems.find((item) => item.path === location.pathname) ?? navigationItems[0];

  return (
    <Box className="app-layout">
      <AppBar position="fixed" color="inherit" elevation={0} className="topbar">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            className="menu-button"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h2" component="h1">{currentPage.label}</Typography>
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
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Drawer variant="permanent" open className="desktop-drawer">
          <SidebarContent />
        </Drawer>
      </Box>

      <Box component="main" className="main-content">
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export { drawerWidth };