import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TableSortLabel from "@mui/material/TableSortLabel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Tooltip from "@mui/material/Tooltip";

import IGStatusChip from "../ui/IGStatusChip";
import DeviceDrawer from "./DeviceDrawer";

export default function EnterpriseDiscoveryTable({ devices }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("ip_address");
  
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleFilterClick = (event) => setFilterMenuAnchor(event.currentTarget);
  const handleFilterClose = () => setFilterMenuAnchor(null);
  const handleFilterSelect = (type) => {
    setFilterType(type);
    setPage(0);
    handleFilterClose();
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      // Search
      const searchStr = `${dev.ip_address} ${dev.hostname} ${dev.vendor} ${dev.mac_address}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());

      // Filter
      const type = (dev.device_type || "Unknown").toLowerCase();
      const isReachable = dev.reachable !== false;
      const status = isReachable ? "Healthy" : "Offline";
      
      let matchesFilter = true;
      switch (filterType) {
        case "Routers": matchesFilter = type.includes("router"); break;
        case "PC": matchesFilter = type.includes("desktop") || type.includes("laptop") || type.includes("pc"); break;
        case "Printer": matchesFilter = type.includes("printer"); break;
        case "Unknown": matchesFilter = type.includes("unknown"); break;
        case "Offline": matchesFilter = status === "Offline"; break;
        case "Healthy": matchesFilter = status === "Healthy"; break;
        default: matchesFilter = true;
      }
      return matchesSearch && matchesFilter;
    });
  }, [devices, searchQuery, filterType]);

  const sortedDevices = useMemo(() => {
    return [...filteredDevices].sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];
      
      if (orderBy === "status") {
        valA = a.reachable !== false ? "Healthy" : "Offline";
        valB = b.reachable !== false ? "Healthy" : "Offline";
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredDevices, order, orderBy]);

  const paginatedDevices = sortedDevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderSortableHeadCell = (id, label) => (
    <TableCell sortDirection={orderBy === id ? order : false} sx={{ fontWeight: 700, color: "text.primary" }}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : "asc"}
        onClick={() => handleRequestSort(id)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center", justifyContent: "space-between" }}>
        <TextField
          size="small"
          placeholder="Search devices..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300, bgcolor: "background.paper" }}
        />
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Filter:
          </Typography>
          <Chip 
            label={filterType} 
            color="primary" 
            variant="outlined" 
            deleteIcon={<FilterListIcon />}
            onDelete={handleFilterClick}
            onClick={handleFilterClick}
          />
          <Menu anchorEl={filterMenuAnchor} open={Boolean(filterMenuAnchor)} onClose={handleFilterClose}>
            {["All", "Routers", "PC", "Printer", "Unknown", "Offline", "Healthy"].map((f) => (
              <MenuItem key={f} onClick={() => handleFilterSelect(f)} selected={filterType === f}>
                {f}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 950 }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              {renderSortableHeadCell("status", "Status")}
              {renderSortableHeadCell("hostname", "Device Name")}
              {renderSortableHeadCell("ip_address", "IP")}
              {renderSortableHeadCell("vendor", "Brand")}
              {renderSortableHeadCell("mac_address", "MAC")}
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Verification</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Last Seen</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No devices match your search or filter criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDevices.map((dev) => {
                const isReachable = dev.reachable !== false;
                const status = isReachable ? "Healthy" : "Offline";
                const hostname = dev.hostname && dev.hostname !== "Not Available" ? dev.hostname : "Unknown Host";
                const ip = dev.ip_address;
                const mac = dev.mac_address || "Not Discovered";
                const vendor = dev.vendor && dev.vendor !== "Local Host" ? dev.vendor : "Unknown";
                const confidence = dev.confidence_score ?? (isReachable ? 80 : 0);
                const verificationLabel = `${confidence}% Verified`;
                const lastSeen = isReachable ? "Just Now" : "2 mins ago";

                return (
                  <TableRow 
                    key={ip} 
                    hover 
                    onClick={() => setSelectedDevice(dev)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <IGStatusChip status={status} label={status} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>
                      {hostname}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {ip}
                    </TableCell>
                    <TableCell sx={{ color: vendor === "Unknown" ? "text.secondary" : "text.primary" }}>
                      {vendor}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem", color: "text.secondary" }}>
                      {mac}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={verificationLabel} 
                        size="small" 
                        color={confidence >= 80 ? "success" : confidence >= 40 ? "warning" : "default"} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      {lastSeen}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedDevice(dev); }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredDevices.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Right Drawer */}
      <DeviceDrawer 
        open={Boolean(selectedDevice)} 
        onClose={() => setSelectedDevice(null)} 
        device={selectedDevice} 
      />
    </Box>
  );
}
