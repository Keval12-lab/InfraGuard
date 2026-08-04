import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

/**
 * Standardized Enterprise Section wrapper
 * @param {string} title - Section title
 * @param {string} description - Optional section description
 * @param {React.ReactNode} action - Optional action button(s) for the section
 * @param {React.ReactNode} children - The section content (grid, cards, etc)
 */
export default function IGSection({ title, description, action, children }) {
  return (
    <Box component="section" sx={{ mb: 6 }}>
      {(title || action) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          {title && (
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Box>
          )}
          {action && (
            <Stack direction="row" spacing={1.5}>
              {action}
            </Stack>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
}
