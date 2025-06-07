import { Grid, Card, Typography, Box } from "@mui/material";

export default function DashboardQuickStats({ stats }) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center" alignItems="stretch">
      {stats.map((stat) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={stat.label}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              minWidth: 200,
              minHeight: 140,
              boxShadow: 3,
            }}
          >
            <Box sx={{ mb: 1 }}>{stat.icon}</Box>
            <Typography variant="h5" align="center">
              {stat.value}
            </Typography>
            <Typography color="text.secondary" align="center">
              {stat.label}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}