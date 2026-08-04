# InfraGuard Manual Test Cases & Hardware Validation Log

This document maintains strict adherence to the **"Never Guess"** philosophy. Devices are explicitly labeled as **Verified** (physically tested on live hardware), **Simulated** (interview practice mode), or **Pending Validation** (targeted lab specs).

## 🧪 Test Execution Matrix

| Test ID | Test Scenario | Target Hardware / Environment | Status | Verification Detail / Audit Note |
| :---: | :--- | :--- | :---: | :--- |
| **TC-01** | Gateway Discovery | Jio Fiber Gateway (`192.168.29.1`) | 🟢 Verified | ICMP + ARP resolved Jio Infocomm OUI & Gateway IP |
| **TC-02** | Windows Workstation | Windows 11 Laptop (`192.168.29.25`) | 🟢 Verified | ICMP + NetBIOS hostname resolution verified |
| **TC-03** | Smartphone MAC Privacy | Android / iPhone Device | 🟢 Verified | ARP OUI brand detection with privacy MAC handling |
| **TC-04** | Cable / Offline Recovery | Unplugged Host Diagnostic | 🟢 Verified | Marked "Offline - Last Seen 2 mins ago" |
| **TC-05** | Practice Network Simulation| Interview Practice Mode | 🔵 Simulated | 8-device realistic SMB enterprise dataset loaded |
| **TC-06** | Wireless Router Scan | TP-Link Archer C6 (`192.168.1.1`) | 🟡 Pending | Target spec for physical lab verification |
| **TC-07** | Enterprise Managed Switch | Cisco Catalyst 2960 (`192.168.29.2`) | 🟡 Pending | Target spec for SNMP IF-MIB / LLDP verification |
| **TC-08** | IP Camera Telemetry | Hikvision DS-2CD2143 (`192.168.29.55`) | 🟡 Pending | Target spec for HTTP / OUI vendor verification |
| **TC-09** | Storage NAS Health | Synology DiskStation DS920+ | 🟡 Pending | Target spec for Synology MIB storage verification |
| **TC-10** | Network Printer Audit | HP OfficeJet Pro (`192.168.29.40`) | 🟡 Pending | Target spec for Printer MIB (RFC 3805) verification |

## 📊 Status Legend & Breakdown
- 🟢 **Verified**: Physically tested on live local network hardware.
- 🔵 **Simulated**: Simulated dataset for interview demonstration mode (`/api/v1/discovery/demo`).
- 🟡 **Pending Validation**: Target hardware spec defined; pending physical device access in lab.

## 🎯 Verification Guarantee
> *"InfraGuard only displays information that it can verify using one or more network sources. Zero guessed hostnames or fabricated switch topologies."*
