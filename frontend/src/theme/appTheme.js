import { createTheme } from "@mui/material/styles";
import { TOKENS } from "./designTokens";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0284C7", // Sky Blue
      light: "#38BDF8",
      dark: "#0369A1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#64748B", // Slate
      light: "#94A3B8",
      dark: "#334155",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
    success: {
      main: "#10B981", // Emerald
      light: "#34D399",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B", // Amber
      light: "#FBBF24",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444", // Red
      light: "#F87171",
      dark: "#DC2626",
    },
    info: {
      main: "#0284C7",
    },
  },
  shape: { borderRadius: TOKENS.RADIUS.md },
  breakpoints: {
    values: {
      xs: 0,
      sm: TOKENS.BREAKPOINTS.mobile,
      md: TOKENS.BREAKPOINTS.tablet,
      lg: TOKENS.BREAKPOINTS.laptop,
      xl: TOKENS.BREAKPOINTS.desktop,
    },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.025em" },
    h2: { fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.015em" },
    h4: { fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontSize: "1.05rem", fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontSize: "0.95rem", fontWeight: 600 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 600 },
    body1: { fontSize: "0.925rem", lineHeight: 1.5 },
    body2: { fontSize: "0.85rem", lineHeight: 1.45 },
    caption: { fontSize: "0.78rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 600,
          "&:hover": {
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: TOKENS.RADIUS.md,
          boxShadow: TOKENS.SHADOW.card,
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#F8FAFC",
          color: "#475569",
          fontWeight: 600,
          fontSize: "0.82rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          borderBottom: "1px solid #E2E8F0",
        },
        body: {
          fontSize: "0.875rem",
          borderBottom: "1px solid #F1F5F9",
        },
      },
    },
  },
});

export default appTheme;
