import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 5,
        textAlign: "center",
        borderRadius: 3,
        borderColor: "divider",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
      }}
    >
      {icon && (
        <Box
          sx={{
            mb: 2,
            color: "text.secondary",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mb: 3 }}>
          {description}
        </Typography>
      )}
      {action && <Box>{action}</Box>}
    </Paper>
  );
}
