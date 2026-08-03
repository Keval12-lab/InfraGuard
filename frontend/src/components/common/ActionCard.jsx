import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function ActionCard({ title, description, icon, action, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderColor: "primary.main",
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", alignItems: "flex-start", gap: 2 }}>
        {icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "primary.50",
              color: "primary.main",
              display: "flex",
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem", mb: 0.5 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Box>
      </CardContent>
    </Card>
  );
}
