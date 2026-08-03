import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import SectionHeader from "./SectionHeader";

export default function ChartContainer({ title, description, action, children }) {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 3 }}>
        {(title || description) && (
          <SectionHeader title={title} description={description} action={action} />
        )}
        <Box sx={{ width: "100%", mt: 1 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
