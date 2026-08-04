import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { TOKENS } from "../../theme/designTokens";

/**
 * Standardized Enterprise Page Header
 * @param {string} title - The main page title
 * @param {string} subtitle - Optional description below the title
 * @param {React.ReactNode} icon - Optional icon to display next to the title
 * @param {React.ReactNode} action - Optional action button(s) on the right
 */
export default function IGPageHeader({ title, subtitle, icon, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: { xs: 3, sm: 4 }, // Uses MUI 8px spacing standard (24px - 32px)
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 1.2,
              borderRadius: TOKENS.RADIUS.sm,
              bgcolor: "rgba(2, 132, 199, 0.08)", // subtle primary bg
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {action && (
        <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
          {action}
        </Stack>
      )}
    </Box>
  );
}
