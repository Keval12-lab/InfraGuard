import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumb && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 1,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          {breadcrumb}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: "text.primary", letterSpacing: "-0.02em" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 0.5, maxWidth: 700 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>{action}</Box>
        )}
      </Box>
    </Box>
  );
}
