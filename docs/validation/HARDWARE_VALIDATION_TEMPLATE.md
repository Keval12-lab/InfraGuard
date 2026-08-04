# Hardware Validation Log Template

## Device Information
- **Category:** [Router / Switch / PC / Mobile / Printer / Camera / NAS]
- **Make / Brand:** [e.g., Jio Infocomm / TP-Link / Dell / Apple]
- **Model:** [e.g., Jio Fiber Gateway JCO4000]
- **Firmware / OS:** [e.g., v2.4.1 / Windows 11 23H2]
- **Tested IP:** [e.g., 192.168.29.1]

## Validation Results

| Test Parameter | Expected Outcome | Actual Outcome | Status |
| :--- | :--- | :--- | :---: |
| **ICMP Ping Probe** | Respond within < 5 ms | Responded in 1.45 ms | ✅ PASS |
| **MAC Address Resolution** | Retrieve physical MAC | MAC: A4:91:B1:C2:D3:E4 | ✅ PASS |
| **Vendor OUI Match** | Classify brand | Matched "Jio Infocomm" | ✅ PASS |
| **SNMP System MIB** | Fetch Hostname/System Info | Timeout (SNMP Disabled) | ⚠️ EXPECTED |
| **Confidence Score** | 80% (Ping + MAC Verified) | 80% (Verified by Ping & MAC) | ✅ PASS |
| **Fix Suggestions** | Actionable troubleshooting | "No action required. Connection healthy." | ✅ PASS |

## Test Verification Summary
- **Tested Environment:** Home/Office Wi-Fi (Subnet: 192.168.29.0/24)
- **Tester:** InfraGuard QA / Support Engineer
- **Verification Date:** 2026-08-04
- **Final Verdict:** ✅ PASSED FIELD VALIDATION
