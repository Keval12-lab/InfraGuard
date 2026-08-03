# InfraGuard — Detailed Feature Specifications & Business Rules

**Version:** 1.0.0  
**Product Area:** Module Specifications, Data Models & Business Logic Constraints

---

## 1. Network Discovery Module

### Purpose

To scan specified IPv4 subnets without agents, identify active host IP addresses via ICMP/ARP, resolve hostnames/MAC vendors, and classify device categories.

### Specifications

- **User Story:** As a Network Administrator, I want to scan a `/24` subnet range so that I can automatically discover all attached hardware devices without manual data entry.
- **Inputs:**
  - Target Subnet CIDR (e.g. `192.168.1.0/24`)
  - Scan Mode (`Quick ICMP`, `ARP Resolution`, `SNMP Deep Discovery`)
  - Timeout per host (ms, default `500ms`)
- **Outputs:**
  - Discovered Device Array (`IP`, `MAC`, `Hostname`, `Vendor`, `Latency`, `ResponseStatus`)
  - Scan Metrics (`TotalIPsScanned`, `ActiveCount`, `DurationSeconds`)
- **Business Rules:**
  1. CIDR range must not exceed `/22` (1024 IPs) in a single manual scan to prevent network congestion.
  2. Broadcast (`.255`) and Network ID (`.0`) IPs are excluded from status counts.
  3. If a host responds to ICMP within 500ms, mark `ResponseStatus = "ONLINE"`.
- **Validation Rules:** Valid CIDR format checked via regex `^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$`.
- **Edge Cases & Failure Cases:**
  - Host blocking ICMP (Firewall active): Mark as `UNMANAGED_SILENT` if ARP table contains MAC entry.
  - Backend subnet socket failure: Graceful error fallback displaying `DISCOVERY_SOCKET_PERMISSION_DENIED` prompt.

---

## 2. Infrastructure Asset Inventory Module

### Purpose

To store, categorize, search, filter, and inspect all discovered infrastructure hardware across the enterprise network.

### Specifications

- **User Story:** As an IT Manager, I want to search and filter discovered devices by IP address, manufacturer, or status so that I can audit hardware compliance.
- **Inputs:** Search string, Filter Pills (Status, Device Type), Sort Order.
- **Outputs:** Paginated asset list, summarized counts, interactive side inspection panel.
- **Business Rules:**
  1. Devices not responding to polling for 3 consecutive cycles (3 x 60s) transition from `ONLINE` to `OFFLINE`.
  2. Devices newly discovered within 24 hours receive a `NEW` badge.
  3. Vendor MAC resolution uses IEEE OUI lookup database.
- **Edge Cases & Failure Cases:**
  - Duplicate IP addresses detected (IP conflict): Flag both host records with a `CRITICAL_IP_CONFLICT` warning.

---

## 3. Real-Time Telemetry & Health Monitoring Module

### Purpose

To periodically poll registered devices, compute latency metrics (Min/Max/Avg), track packet loss, and present interactive time-series visualizations.

### Specifications

- **User Story:** As a Systems Administrator, I want to view historical ping latency and loss metrics so that I can identify network degradation before an outage occurs.
- **Inputs:** Target Device ID, Time Range (`1h`, `24h`, `7d`).
- **Outputs:** Telemetry data series (`timestamp`, `latency_ms`, `loss_percent`).
- **Business Rules:**
  1. Background thread polls active devices every 60 seconds.
  2. Telemetry data aggregated into 15-minute average buckets after 24 hours to optimize storage footprint.
- **Edge Cases & Failure Cases:**
  - Network link failure: High packet loss (100%) triggers an immediate status update and critical event log entry.

---

## 4. Executive Reporting & Audit Module

### Purpose

To generate formatted PDF and CSV infrastructure audit reports summarizing SLA compliance, asset counts, and incident logs.

### Specifications

- **User Story:** As an MSP Account Manager, I want to export a PDF SLA summary report for my client so that I can demonstrate network uptime compliance.
- **Inputs:** Date range selection, Include/Exclude summary sections checkbox.
- **Outputs:** Styled PDF file download (`InfraGuard-Executive-Report.pdf`).
- **Business Rules:**
  1. SLA uptime percentage calculated as: `(Total Monitored Hours - Offline Hours) / Total Monitored Hours * 100`.
  2. Executive reports include InfraGuard verification watermark and system timestamp.

---

## 5. Platform Settings & Configuration Module

### Purpose

To manage SNMP credentials, notification webhooks, scan intervals, and system logs.

### Specifications

- **User Story:** As an Administrator, I want to configure Slack webhook integration so that I receive instant alerts when a core switch goes offline.
- **Inputs:** Webhook URL, Auth Tokens, Polling Frequencies.
- **Outputs:** Secured configuration store, test payload delivery validation.
- **Business Rules:**
  1. All SNMP community strings and API tokens stored with AES-256 encryption at rest.
  2. Webhook triggers fire only on `STATE_CHANGE` (e.g. `ONLINE` -> `OFFLINE`) to prevent alert fatigue.
