import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { TOKENS } from "../../theme/designTokens";

/**
 * Standardized Enterprise Card Component
 * @param {string} title - Optional title of the card
 * @param {string} subtitle - Optional subtitle
 * @param {React.ReactNode} action - Optional action element (e.g., a button or icon)
 * @param {React.ReactNode} children - The card content
 * @param {boolean} noPadding - If true, removes padding from CardContent
 * @param {object} sx - Additional styles
 */
export default function IGCard({ title, subtitle, action, children, noPadding = false, sx = {} }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: TOKENS.SHADOW.hover,
          borderColor: "primary.main",
        },
        ...sx,
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            p: 3,
            pb: 1.5,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <CardContent
        sx={{
          flexGrow: 1,
          p: noPadding ? 0 : 3,
          pt: (title || action) && !noPadding ? 1 : (noPadding ? 0 : 3),
          "&:last-child": { pb: noPadding ? 0 : 3 },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
