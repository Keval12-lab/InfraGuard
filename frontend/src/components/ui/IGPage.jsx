import React from "react";
import Box from "@mui/material/Box";

/**
 * Standardized Enterprise Page Layout Wrapper
 * @param {React.ReactNode} children - The page content (Header, Sections, Grids)
 */
export default function IGPage({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3, // Standard 24px gap between top-level page elements
        width: "100%",
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
          "0%": { opacity: 0, transform: "translateY(5px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        }
      }}
    >
      {children}
    </Box>
  );
}
