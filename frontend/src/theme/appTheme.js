import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6feb" },
    background: {
      default: "#f6f8fa",
      paper: "#ffffff"
    },
    text: {
      primary: "#24292f",
      secondary: "#57606a"
    }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700 },
    h2: { fontSize: "1.25rem", fontWeight: 700 },
    body1: { fontSize: "0.95rem" }
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true
      }
    }
  }
});