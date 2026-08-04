import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { TOKENS } from "../../theme/designTokens";

/**
 * Standardized Enterprise Empty State
 * @param {React.ReactNode} icon - Main visual icon
 * @param {string} title - Primary empty state message
 * @param {string} description - Secondary context
 * @param {React.ReactNode} action - Optional action button
 */
export default function IGEmptyState({ icon, title, description, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: { xs: 4, sm: 6 },
        bgcolor: "#F8FAFC",
        borderRadius: TOKENS.RADIUS.md,
        border: "1px dashed #CBD5E1",
        minHeight: 280,
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, color: "secondary.main", opacity: 0.7, "& > svg": { fontSize: 56 } }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
      {action && <Box>{action}</Box>}
    </Box>
  );
}
