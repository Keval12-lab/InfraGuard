import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LanOutlinedIcon from "@mui/icons-material/LanOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export const navigationItems = [
  { label: "Dashboard", path: "/", icon: DashboardOutlinedIcon },
  { label: "Assets", path: "/assets", icon: Inventory2OutlinedIcon },
  { label: "Network", path: "/network", icon: LanOutlinedIcon },
  { label: "Reports", path: "/reports", icon: AssessmentOutlinedIcon },
  { label: "Settings", path: "/settings", icon: SettingsOutlinedIcon }
];