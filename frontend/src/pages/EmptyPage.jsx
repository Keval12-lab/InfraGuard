import React from "react";

import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

export default function EmptyPage({ title, description, children }) {
  const navigate = useNavigate();

  return (
    <Stack spacing={3} sx={{ maxWidth: 1280, mx: "auto", pb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Chip
          label="Coming Soon"
          color="primary"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>
      <Typography color="text.secondary">{description}</Typography>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        {children ?? (
          <Box
            sx={{
              py: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Module Under Active Development
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
              The {title} module will be introduced in a future milestone. Please use
              Network Discovery and Asset Repository for active infrastructure management.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate("/discovery")}
                sx={{ borderRadius: 2 }}
              >
                Go to Discovery
              </Button>
              <Button
                variant="outlined"
                startIcon={<InventoryIcon />}
                onClick={() => navigate("/assets")}
                sx={{ borderRadius: 2 }}
              >
                Go to Assets
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
