# Quality Assurance Checklist

Run this checklist for every newly developed module or feature release.

## 🏁 Quality Checklist Items

### 1. Build Verification

- [ ] React production build compiles without warnings (`npm run build`).
- [ ] Flask python server starts cleanly with no import issues.

### 2. Backend Services

- [ ] Exception boundaries set on all OS process calls.
- [ ] Logs stamped with ISO UTC time.

### 3. API Reliability

- [ ] Route responses are wrapped in standard success/error structures.
- [ ] Payload attributes validated (IP, MAC syntax).

### 4. Database Schema

- [ ] Tables use strict constraints and foreign keys.
- [ ] DB connections closed and released immediately.

### 5. User Interface (UI)

- [ ] Outfit font weights and HSL theme variables applied.
- [ ] Loading progress state feedback displayed during query execution.
- [ ] Empty state visual guidelines followed for empty list returns.

### 6. Error & Boundary States

- [ ] Network failure or route failure returns visual message instead of application crash.
