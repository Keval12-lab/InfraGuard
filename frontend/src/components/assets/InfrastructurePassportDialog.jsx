import React, { useState, useEffect } from "react";

// Icons
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SaveIcon from "@mui/icons-material/Save";
import VerifiedIcon from "@mui/icons-material/Verified";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Custom Hooks & Components
import { useAssetPassport, useUpdateAssetPassport } from "../../hooks/usePassport";
import StatusChip from "../common/StatusChip";

export default function InfrastructurePassportDialog({ open, onClose, deviceId }) {
  const [activeTab, setActiveTab] = useState(0);

  const { data: passportData, isLoading } = useAssetPassport(deviceId);
  const { mutateAsync: updatePassport, isPending: isSaving } = useUpdateAssetPassport();

  // Form State
  const [formData, setFormData] = useState({
    serial_number: "",
    firmware_version: "",
    building: "",
    floor: "",
    room: "",
    rack: "",
    rack_unit: "",
    pdu_port: "",
    owner: "",
    department: "",
    purchase_date: "",
    warranty_expiry: "",
    vendor_contact: "",
    amc_contract: "",
    notes_md: "",
  });

  useEffect(() => {
    if (passportData?.passport) {
      const p = passportData.passport;
      setFormData({
        serial_number: p.serial_number || "",
        firmware_version: p.firmware_version || "",
        building: p.building || "",
        floor: p.floor || "",
        room: p.room || "",
        rack: p.rack || "",
        rack_unit: p.rack_unit || "",
        pdu_port: p.pdu_port || "",
        owner: p.owner || "",
        department: p.department || "",
        purchase_date: p.purchase_date || "",
        warranty_expiry: p.warranty_expiry || "",
        vendor_contact: p.vendor_contact || "",
        amc_contract: p.amc_contract || "",
        notes_md: p.notes_md || "",
      });
    }
  }, [passportData]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await updatePassport({ deviceId, payload: formData });
      onClose();
    } catch (err) {
      console.error("Failed to save Infrastructure Passport:", err);
    }
  };

  const p = passportData?.passport || {};
  const warranty = passportData?.warranty_summary || {};
  const qrPayload = passportData?.qr_payload || `INFRAGUARD-PASSPORT:ID=${deviceId}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <VerifiedIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Infrastructure Passport
            </Typography>
            <Typography variant="caption" color="text.secondary" className="font-mono">
              Asset #{deviceId} • {p.ip_address} ({p.hostname || "Unbound Host"})
            </Typography>
          </Box>
        </Box>
        <Chip
          label="LIVING RECORD"
          color="primary"
          size="small"
          sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: "0.7rem" }}
        />
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2.5 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab
            icon={<BadgeIcon fontSize="small" />}
            label="Technical Overview"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            icon={<LocationOnIcon fontSize="small" />}
            label="Physical Location"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            icon={<BusinessCenterIcon fontSize="small" />}
            label="Business & Warranty"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            icon={<DescriptionIcon fontSize="small" />}
            label="Notes & QR Tag"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, minHeight: 380 }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={100} />
          </Stack>
        ) : (
          <>
            {/* TAB 0: TECHNICAL OVERVIEW */}
            {activeTab === 0 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      IP ADDRESS
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      className="font-mono"
                      sx={{ fontWeight: 700 }}
                    >
                      {p.ip_address}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      HOSTNAME
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      className="font-mono"
                      sx={{ fontWeight: 700 }}
                    >
                      {p.hostname || "N/A"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      VENDOR & DEVICE TYPE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {p.vendor} ({p.device_type})
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      MONITORING HEALTH
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <StatusChip status={p.status} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Hardware Serial Number"
                    size="small"
                    value={formData.serial_number}
                    onChange={handleChange("serial_number")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Firmware / OS Version"
                    size="small"
                    value={formData.firmware_version}
                    onChange={handleChange("firmware_version")}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 1: PHYSICAL LOCATION */}
            {activeTab === 1 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Building Name"
                    size="small"
                    placeholder="e.g. Corporate HQ"
                    value={formData.building}
                    onChange={handleChange("building")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Floor Level"
                    size="small"
                    placeholder="e.g. Floor 3"
                    value={formData.floor}
                    onChange={handleChange("floor")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Room Number"
                    size="small"
                    placeholder="e.g. Server Room 302"
                    value={formData.room}
                    onChange={handleChange("room")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Rack ID"
                    size="small"
                    placeholder="e.g. Rack A-12"
                    value={formData.rack}
                    onChange={handleChange("rack")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Rack Unit (RU)"
                    size="small"
                    placeholder="e.g. U14 - U16"
                    value={formData.rack_unit}
                    onChange={handleChange("rack_unit")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="PDU Port Mapping"
                    size="small"
                    placeholder="e.g. PDU-B Port 4"
                    value={formData.pdu_port}
                    onChange={handleChange("pdu_port")}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 2: BUSINESS & WARRANTY */}
            {activeTab === 2 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Asset Owner / Lead Engineer"
                    size="small"
                    value={formData.owner}
                    onChange={handleChange("owner")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Department / Cost Center"
                    size="small"
                    value={formData.department}
                    onChange={handleChange("department")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Purchase Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={formData.purchase_date}
                    onChange={handleChange("purchase_date")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Warranty Expiration Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={formData.warranty_expiry}
                    onChange={handleChange("warranty_expiry")}
                    fullWidth
                  />
                </Grid>
                {warranty.status && (
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor:
                          warranty.status === "ACTIVE"
                            ? "rgba(16,185,129,0.05)"
                            : "rgba(245,158,11,0.05)",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Warranty Status: {warranty.status} (
                        {warranty.days_remaining !== null
                          ? `${warranty.days_remaining} days remaining`
                          : "N/A"}
                        )
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vendor Support Contact (Phone/Email)"
                    size="small"
                    value={formData.vendor_contact}
                    onChange={handleChange("vendor_contact")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Service Contract / AMC Reference"
                    size="small"
                    value={formData.amc_contract}
                    onChange={handleChange("amc_contract")}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 3: NOTES & QR PRINTABLE TAG */}
            {activeTab === 3 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={7}>
                  <TextField
                    label="Technical Documentation & Notes (Markdown)"
                    multiline
                    rows={8}
                    value={formData.notes_md}
                    onChange={handleChange("notes_md")}
                    placeholder="# Maintenance History\n- Cable replaced 2026-07-30\n- Port 4 configured for VLAN 20"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      borderRadius: 2.5,
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <QrCode2Icon sx={{ fontSize: 72, color: "primary.main", mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Asset QR Sticker Tag
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1.5 }}
                    >
                      Scan tag with InfraGuard Mobile to open living passport.
                    </Typography>

                    <Paper
                      variant="outlined"
                      className="font-mono"
                      sx={{
                        p: 1,
                        bgcolor: "#FFFFFF",
                        fontSize: "0.7rem",
                        wordBreak: "break-all",
                        mb: 1.5,
                      }}
                    >
                      {qrPayload}
                    </Paper>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<QrCode2Icon />}
                      onClick={() => window.print()}
                    >
                      Print Sticker Label
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isSaving}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {isSaving ? "Saving Passport..." : "Save Infrastructure Passport"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
