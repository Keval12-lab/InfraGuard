import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IGCard from "./IGCard";

/**
 * Standardized Enterprise Metric Card Component
 * @param {string} title - The metric title (e.g. "Healthy Devices")
 * @param {string|number} value - The primary metric value
 * @param {string} caption - Optional secondary text below value
 * @param {React.ElementType} icon - The Material UI icon component
 * @param {string} color - The theme color string (e.g. "success.main")
 * @param {boolean} isMono - If true, applies monospace font to the value
 */
export default function IGMetricCard({ title, value, caption, icon: IconComponent, color = "primary.main", isMono = false }) {
  return (
    <IGCard variant="metric" noPadding>
      <Box sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}
          >
            {title}
          </Typography>
          {IconComponent && (
            <Box
              sx={{
                p: 0.8,
                borderRadius: 1.5,
                bgcolor: "rgba(2, 132, 199, 0.08)", // Generic light background, can be mapped to color later
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconComponent sx={{ color: color, fontSize: 20 }} />
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          component="div"
          className={isMono ? "font-mono" : ""}
          sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, textAlign: "left" }}
        >
          {value}
        </Typography>
        {caption && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "left", fontWeight: 500 }}
          >
            {caption}
          </Typography>
        )}
      </Box>
    </IGCard>
  );
}
