import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function EmptyPage({ title, description, children }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Box>
      <Paper variant="outlined" className="empty-state-panel">
        {children ?? <Typography color="text.secondary">This page is ready for a future milestone.</Typography>}
      </Paper>
    </Stack>
  );
}