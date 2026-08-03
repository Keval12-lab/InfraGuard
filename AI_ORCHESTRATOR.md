# InfraGuard AI Orchestrator

This document governs the execution of all engineering and stabilization tasks by the AI assistant. By prioritizing these instructions and reference guidelines, we ensure strict development consistency across both backend and frontend layers.

---

## 1. Priority Reference Documents

When executing any task or sprint (e.g., refactoring components, patching libraries, or updating config modules), the AI must load and prioritize the following files in this order:

1.  **Engineering Standard:** [docs/ENGINEERING_STANDARD.md](file:///e:/Development/Projects/InfraGuard/docs/ENGINEERING_STANDARD.md)
    - _Rules:_ React best practices, strict typechecks, centralized error paradigms, styling constraints.
2.  **Stabilization Roadmap:** [docs/STABILIZATION_ROADMAP.md](file:///e:/Development/Projects/InfraGuard/docs/STABILIZATION_ROADMAP.md)
    - _Rules:_ Scope of Stabilization Sprints, file quotas, and objectives.
3.  **Developer Workflow & Lint Rules:** [docs/DEVELOPER_WORKFLOW.md](file:///e:/Development/Projects/InfraGuard/docs/DEVELOPER_WORKFLOW.md) and `eslint.config.js`
    - _Rules:_ Pre-commit checks, lint compliance, and workspace commands.
4.  **Latest Sprint Report:** [docs/SPRINT_3_REPORT.md](file:///e:/Development/Projects/InfraGuard/docs/SPRINT_3_REPORT.md)
    - _Rules:_ Baseline status and pending security patches.
5.  **Technical Architecture:** [docs/TECHNICAL_ARCHITECTURE.md](file:///e:/Development/Projects/InfraGuard/docs/TECHNICAL_ARCHITECTURE.md)
    - _Rules:_ Data model constraints, state management, and component boundaries.

---

## 2. Release Gates (Compulsory Verification Rules)

Before any sprint can be marked complete, the AI must verify that every check passes. **If any gate fails, the sprint must remain open and the issue must be resolved immediately.**

1.  **Build Gate:**
    - _Command:_ `npm run build` (or `npm run build:frontend`) must exit with code `0`.
2.  **Lint Gate:**
    - _Command:_ `npm run lint` must exit with `0` errors.
3.  **Typecheck Gate:**
    - _Command:_ `npm run typecheck` (or workspace TS compilation) must pass.
4.  **Unused Files Gate:**
    - _Command:_ `npm run unused` (Knip verification) must run without unresolved orphans.
5.  **Security Gate:**
    - _Command:_ `npm audit` (and Python dependency scans) must report zero high/critical vulnerabilities.
6.  **Aesthetics & Rendering Gate:**
    - The UI must maintain rich glassmorphism/dark mode styles and preserve standard layout alignments.

---

## 3. Micro-Phase Orchestration Rule (Sprint 4 Refactoring)

For high-risk refactoring tasks (like splitting `TopologyPage.jsx`):

- **A: Analysis Phase:** Create complete dependency graphs, state tracking trees, hook uses, and render maps. **NO CODE MODIFICATIONS.**
- **B: Splitting Plan:** Outline proposed file subdivisions and folder architecture. **NO CODE MODIFICATIONS.**
- **C: Incremental Splits:** Refactor and commit one component at a time, running compile and build checks after every single component extraction.
