import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LanOutlinedIcon from "@mui/icons-material/LanOutlined";
import MemoryIcon from "@mui/icons-material/Memory";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RadarOutlinedIcon from "@mui/icons-material/RadarOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";

export const navigationItems = [
  { label: "Dashboard", path: "/", icon: DashboardOutlinedIcon, disabled: false },
  { label: "Discovery", path: "/discovery", icon: RadarOutlinedIcon, disabled: false },
  { label: "Assets", path: "/assets", icon: Inventory2OutlinedIcon, disabled: false },
  { label: "Workspace", path: "/workspace", icon: TerminalOutlinedIcon, disabled: false },
  { label: "Timeline", path: "/timeline", icon: HistoryOutlinedIcon, disabled: false },
  { label: "Runbooks", path: "/runbooks", icon: PlayCircleOutlineIcon, disabled: false },
  { label: "Automation", path: "/automations", icon: MemoryIcon, disabled: false },
  { label: "Network", path: "/network", icon: LanOutlinedIcon, disabled: false },
  { label: "Reports", path: "/reports", icon: AssessmentOutlinedIcon, disabled: false },
  {
    label: "Settings",
    path: "/settings",
    icon: SettingsOutlinedIcon,
    disabled: true,
    badge: "Coming Soon",
  },
];
