import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function SectionHeader({ title, description, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
