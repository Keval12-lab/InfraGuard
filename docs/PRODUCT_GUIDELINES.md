# InfraGuard Product & Design Constitution (`PRODUCT_GUIDELINES.md`)

> **Permanent Identity Statement:**  
> InfraGuard is an **Evidence-Based IT Operations & Troubleshooting Assistant**.  
> It is **NOT** a raw network scanner, **NOT** a passive monitor, and **NOT** a complex enterprise asset tool.  

---

## 🏛️ The 10 Core Design Principles

1. **One Screen = One Purpose** — Every view must address a single clear user goal.
2. **Show Problems, Not Data** — Highlight actionable issues before dumping telemetry.
3. **Never Guess** — Display strictly verified evidence; state *"Not Available"* for unverified fields.
4. **Every Warning Must Include a Fix** — Pair every diagnostic alert with *"What You Can Try Next"*.
5. **Progressive Disclosure** — Keep technical raw JSON/OIDs nested in engineering tabs.
6. **Fast Before Fancy** — Prioritize `<1.5s` load speeds over heavy complex graphic elements.
7. **Consistency Over Creativity** — Use standardized MUI tokens, spacing, and card radii everywhere.
8. **Accessibility by Default** — Support keyboard navigation (`Tab`, `ESC`) and visible focus rings.
9. **Backend Does the Thinking** — Heavy discovery, correlation, and confidence scoring belong in Flask.
10. **Frontend Builds Trust** — The UI presents clean, predictable, and reassuring status indicators.

---

## 👑 The Founder Rule

> *"If a feature does not help the user **Find the problem**, **Understand the reason**, or **Fix the issue**, it does **NOT** belong in InfraGuard."*

---

## 📊 Information & Visual Hierarchy

```text
Priority 1 (Critical Red)    ➔ Offline Gateways, Unreachable Printers, Internet Drops
Priority 2 (Warning Orange)  ➔ High Latency Spikes, Disk Storage >90%, Packet Loss Probes
Priority 3 (Healthy Green)   ➔ Verified Online Assets, Activity History, Latency Sparklines
Priority 4 (Technical Gray)  ➔ Raw MIB OIDs, SysDescr String, Interface Indexes (Engineers Only)
```

---

## 📏 Data Density & Component Limits

To prevent dashboard clutter as InfraGuard grows:
- **Dashboard Widgets:** Maximum 5 KPI Cards, 1 Topology Map, 1 Attention Panel, 1 Activity Stream.
- **Discovery Table:** Maximum 8 Columns (`Status`, `Device Name`, `IP`, `Brand`, `MAC`, `Verification`, `Last Seen`, `Actions`).
- **Device Drawer:** Maximum 6 Tabs (`Overview`, `Connection`, `Health`, `Troubleshooting`, `History`, `Technical Details`).

---

## ⚡ Performance Budgets

- **Dashboard Load Time:** `< 1.5 seconds`
- **Device Drawer Slide:** `< 200 milliseconds`
- **Global Search Response:** `< 100 milliseconds`
- **Table Render Latency:** `< 50 milliseconds`
- **UI Animation Frame Rate:** `60 FPS` smooth
- **Production JS Bundle:** `< 1.0 MB` gzip size

---

## 🤖 Future AI Assistant Guardrails

When AI diagnostic features are introduced in future versions:
1. **Reads API Only:** Must consume sanitized JSON REST APIs.
2. **Never Touches DB Directly:** Zero direct SQL/ORM query permissions.
3. **Never Executes Commands:** Cannot reboot, wipe, or modify network hardware.
4. **Suggests Solutions Only:** Serves purely as an advisory assistant for human IT engineers.

---

*Document Created: 2026-08-04 | Enforced for All InfraGuard Development*
