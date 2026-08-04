# InfraGuard Enterprise UI System v2 - Guidelines

This document outlines the strict UI design system and components that must be used when developing features for InfraGuard.

## 🚨 Golden Rule
**No new page or component may use raw `Card`, `Paper`, inline spacing, inline colors, or arbitrary typography. All new UI must use the `IG` Design System components and design tokens.**

## 1. Global Layout & Grid
All pages must be wrapped in `<IGPage>`.
The layout must utilize the 12-column grid system, accounting for ultrawide monitors.
Do not use manual `<Box maxWidth={1200}>` or `<Container>`. The `ApplicationShell` handles the 1600px max width and 260px sidebar globally.

**Correct Grid Pattern:**
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={8} xl={9}>
     <MainContent />
  </Grid>
  <Grid item xs={12} md={4} xl={3}>
     <SidebarContent />
  </Grid>
</Grid>
```

## 2. Component Library

### `IGPage`
The root wrapper for every route component. Enforces top-level gap spacing and standard entry animations.

### `IGPageHeader`
Used at the top of every page.
```jsx
<IGPageHeader 
  title="Dashboard" 
  subtitle="Infrastructure Overview" 
  icon={<DashboardIcon />} 
  action={<Button>Export</Button>} 
/>
```

### `IGSection`
Wraps horizontal blocks of content (like a Grid of cards or a Table).
```jsx
<IGSection title="Telemetry Metrics">
  <Grid container spacing={3}>...</Grid>
</IGSection>
```

### `IGCard`
The standard container for all content. Supports variants:
- `variant="default"` - Standard padding (24px)
- `variant="metric"` - Compact padding, center aligned
- `variant="topology"` - Full height, no overflow
- `variant="danger"` - Red border highlight
- `variant="success"` - Green border highlight

### `IGMetricCard`
Used for top-level KPI numbers. Do not build manual metric boxes.
```jsx
<IGMetricCard 
  title="Healthy Devices" 
  value="52" 
  icon={CheckCircleIcon} 
  color="success.main" 
/>
```

### `IGStatusChip`
Universally handles all states: `Healthy`, `Warning`, `Offline`, `Scanning`, `Maintenance`, `Initializing`, `Unknown`.

## 3. Spacing & Tokens
Never use inline pixel margins (`mt: "17px"`).
Always use the MUI standard 8px grid multipliers (`mt={2}` = 16px, `gap={3}` = 24px).
If accessing constants manually, import `TOKENS` from `src/theme/designTokens.js`.
