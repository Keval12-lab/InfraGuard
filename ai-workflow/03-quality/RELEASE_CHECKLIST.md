# Release Verification Checklist

Run this checklist before cutting a release build (e.g. v1.0, v2.0).

## 📦 Release Candidate Verification

### 1. Build Compilation

- [ ] Frontend compiled cleanly (`npm run build`).
- [ ] No warnings, lint errors, or unused imports remaining in output.

### 2. API & Service Integration

- [ ] All blueprints registered and operational.
- [ ] Zero placeholder mocks remaining; all lists utilize live database content.

### 3. Log & Console Health

- [ ] No React key warnings or console syntax errors remaining in runtime view.
- [ ] No residual print statements or debug checkpoints left in Python code.

### 4. Release Artifacts

- [ ] Release version bumped in package files.
- [ ] Release summary detailing new features and optimizations written.
