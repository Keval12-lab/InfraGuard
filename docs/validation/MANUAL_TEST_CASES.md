# InfraGuard Manual Test Cases Audit Log (v1.3 Stabilization Sprint)

This document tracks execution and verification of manual field test scenarios across real-world SMB infrastructure environments.

## 🧪 Test Suite Execution Matrix

| Test ID | Test Scenario | Target Device / Environment | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Gateway Discovery | Jio Fiber Router (`192.168.29.1`) | Classified as Gateway + Jio OUI | Identified correctly with 100% confidence | ✅ PASS |
| **TC-02** | Wireless Router Scan | TP-Link Archer C6 (`192.168.1.1`) | Detected IP + MAC + SNMP sysDescr | Identified sysDescr & model | ✅ PASS |
| **TC-03** | Managed L2 Switch | Cisco Catalyst 2960 (`192.168.29.2`) | Discovered 50 interfaces + 4 neighbors | Extracted IF-MIB + LLDP topology | ✅ PASS |
| **TC-04** | Windows Desktop Probe | Windows 11 PC (`192.168.29.25`) | Hostname, IP, MAC resolved | Discovered via ICMP + NetBIOS | ✅ PASS |
| **TC-05** | IP Camera Telemetry | Hikvision DS-2CD2143 (`192.168.29.55`) | Verified Vendor OUI + Port 80 | Detected as Hikvision Digital Tech | ✅ PASS |
| **TC-06** | Network Attached Storage | Synology DS920+ (`192.168.29.100`) | Extracted Synology MIB storage health | Volume Health: Healthy (100%) | ✅ PASS |
| **TC-07** | Network Printer Audit | HP OfficeJet Pro (`192.168.29.40`) | Printer MIB Toner & Status | Toner levels extracted via SNMP | ✅ PASS |
| **TC-08** | Offline Device Recovery | Cable Unplugged Test | Marked as "Offline" with last seen | Displayed "Offline - Last Seen 2 mins ago" | ✅ PASS |
| **TC-09** | Mobile MAC Randomization | Android / Apple Smartphone | Identified IP + MAC Vendor (Apple/Samsung) | Handled randomized MAC gracefully | ✅ PASS |
| **TC-10** | Practice Network Simulation | Demo Trigger (`/api/v1/discovery/demo`)| Loads 8 realistic SMB devices | Instant 100% populated demo dataset | ✅ PASS |

## 📊 Summary
- **Total Test Cases:** 10
- **Passed:** 10 (100%)
- **Failed:** 0
- **Verification Date:** 2026-08-04
- **Release Sign-off:** ✅ InfraGuard v1.3 Stabilization Sprint Passed
