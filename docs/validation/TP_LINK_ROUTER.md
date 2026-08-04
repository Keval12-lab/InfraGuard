# Hardware Validation Log: TP-Link Archer C6 Router

## Device Information
- **Category:** Wireless Router / Access Point
- **Make / Brand:** TP-Link Technologies
- **Model:** Archer C6 AC1200
- **Firmware:** v1.3.6 Build 20230510
- **Tested IP:** 192.168.1.1

## Validation Matrix

| Probe Layer | Expected Result | InfraGuard Telemetry | Status |
| :--- | :--- | :--- | :---: |
| **ICMP Ping** | Responsive (< 2ms) | Latency: 1.12 ms | ✅ PASS |
| **ARP Table** | MAC: 50:C7:BF:11:22:33 | Resolved via OS ARP Cache | ✅ PASS |
| **MAC Vendor OUI** | TP-Link Technologies | Classified as "TP-Link Technologies" | ✅ PASS |
| **SNMP MIB-II** | MIB2 System Info | sysDescr: TP-Link Archer C6 Router | ✅ PASS |
| **Confidence Score** | 100% (Fully Verified) | Calculated Score: 100% | ✅ PASS |
| **Fix Suggestions** | Actionable troubleshooting | "No action required. Connection healthy." | ✅ PASS |

## Audit Summary
- **Tested Subnet:** 192.168.1.0/24
- **Verification Date:** 2026-08-04
- **Final Verdict:** ✅ PASSED FIELD VALIDATION
