# InfraGuard Developer Workflow & Automation Guide

This document explains the development environment configurations, automation scripts, and workflow standards established to maximize developer productivity, minimize bugs, and ensure consistent code quality across the platform.

---

## 1. Local Workspace Configurations

### A. EditorConfig (`.editorconfig`)

- **Purpose:** Ensures consistent line endings, trailing whitespaces, and indentation sizing regardless of the operating system or text editor.
- **Usage:** Automatically applied by compatible IDEs.
- **Benefits:** Prevents massive git diff noise caused by different developers using different editor tab settings (e.g. spaces vs. tabs, CR/LF vs. LF).

### B. VS Code Workspace Settings (`.vscode/`)

- **Purpose:** Recommends necessary visual extensions and configures auto-formatting behavior on save.
- **Settings Included (`settings.json`):**
  - `editor.formatOnSave`: Automatically formats files using Prettier.
  - `editor.codeActionsOnSave`: Automatically triggers ESLint to fix unused imports, sorting, and syntax errors on save.
  - `python.formatting.provider`: Runs Python's `black` formatter on save.
  - `python.linting.flake8Enabled`: Displays real-time Flake8 linter warnings.
- **Recommended Extensions (`extensions.json`):**
  - **ESLint / Prettier:** Automated syntax audits and styling.
  - **Error Lens:** Displays compile/linter errors inline inside the editor for immediate feedback.
  - **REST Client:** Directly run HTTP queries inside the workspace using plain-text `.http` files.
  - **GitLens / MarkdownLint:** Streamlines version control analysis and documentation formatting.

---

## 2. Code Quality & Format Automation

We have added unified commands to the root `package.json` to manage syntax auditing, formatting, and quality checks across both the frontend and backend workspaces.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATION COMMAND MATRIX                       │
├─────────────────────┬──────────────────────────────────────────────────┤
│ Command             │ Operation Executed                               │
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run lint        │ Runs ESLint with auto-fix rules active.          │
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run format      │ Runs Prettier formatting across the project.     │
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run format:check│ Checks file formatting without modifying code.   │
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run typecheck   │ Compiles React JSX under TypeScript Strict Mode. │
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run unused      │ Runs Knip to audit unused files and code exports.│
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run audit       │ Scans NPM registry for dependency security alerts.│
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run clean       │ Resets local node_modules caches and dist bundles│
├─────────────────────┼──────────────────────────────────────────────────┤
│ npm run verify      │ Sequentially executes all quality check suites.  │
└─────────────────────┴──────────────────────────────────────────────────┘
```

### Command Details

#### A. Linting (`npm run lint`)

- **Purpose:** Enforces code safety, variable usage limits, and correct React hooks configurations.
- **Rule Scope:** Flat ESLint config catches console log usage, unsorted imports, duplicate imports, and unused variables.
- **Expected Output:** Auto-fixes formatting/imports and prints warnings for items requiring manual changes.

#### B. Formatting Verification (`npm run format:check` / `npm run format`)

- **Purpose:** Ensures consistent coding styles for Javascript, React JSX, JSON, CSS, and Markdown.
- **Usage:** IDE formats automatically on save; CI runs `format:check` to ensure no unformatted code gets merged.

#### C. Type Verification (`npm run typecheck`)

- **Purpose:** Leverages TypeScript's compiler (`tsc`) in strict type check mode to scan JavaScript/JSX files for runtime type mismatches, missing props, and null reference risks.
- **Usage:** Emits no physical files (`noEmit: true`) but reports type errors in the terminal.

#### D. Unused Code Scans (`npm run unused`)

- **Purpose:** Executes **Knip** to scan import paths and find orphaned component files, unused exports, and unreferenced packages.
- **Benefits:** Keeps the codebase clean and small, ensuring build performance does not degrade over time due to dead weight.

#### E. Local Safety Check (`npm run verify`)

- **Purpose:** Executes format checks, lints, strict type checks, and builds the frontend workspace.
- **Usage:** **Mandatory** before making any commit or submitting pull requests.

---

## 3. Continuous Integration & Pipeline Automation

### A. GitHub Actions CI (`.github/workflows/ci.yml`)

- **Trigger:** Automated execution on every push or pull request to the `main` or `develop` branches.
- **Architecture:** Parallelizes tests, format compliance checks, strict lints, and build validations across both React and Flask workspaces.
- **Pipeline Failures:** The build fails if ESLint detects debugger keywords, if Prettier flags unformatted files, if type checking detects null pointer risks, or if the python files fail to compile.

### B. Dependabot Core Update Engine (`.github/dependabot.yml`)

- **Purpose:** Scans the NPM registry and Pip index weekly for outdated packages and critical CVE security vulnerability patches.
- **Usage:** Automatically opens pull requests containing compatibility details, changelog snippets, and dependency upgrade diffs.

---

## 4. TypeScript Strict Mode Migration Plan

Since the frontend currently uses pure JavaScript (`.js`/`.jsx`), the migration to type-safe TypeScript must progress incrementally to prevent code instability.

### A. Phase 1: JSDoc & JavaScript Type-Checking (Active)

- **Configuration:** The root `tsconfig.json` has `allowJs: true` and `checkJs: true` enabled.
- **How it works:** TypeScript scans existing `.js`/`.jsx` files. You can annotate variables and props using standard JSDoc comments:
  ```javascript
  /**
   * @param {Object} props
   * @param {string} props.title
   * @param {boolean} props.isActive
   */
  function Panel({ title, isActive }) { ... }
  ```
- **Benefit:** Provides type checking and editor autocomplete benefits immediately without having to rename files.

### B. Phase 2: Core Interfaces & Types Definition

- **Task:** Create a shared type library folder `frontend/src/types/` (e.g. `devices.ts`, `api.ts`).
- **Action:** Define strict interfaces for network assets, discovery payloads, and user permissions using TypeScript schemas.

### C. Phase 3: Incremental File Conversion

- **Task:** Rename files from `.js` to `.ts` (or `.jsx` to `.tsx`) starting from the bottom of the dependency chain (leaf nodes) and working upward.
- **Sequence:**
  1.  `frontend/src/services/` (network clients)
  2.  `frontend/src/hooks/` (data hooks)
  3.  `frontend/src/components/common/` (leaf UI)
  4.  `frontend/src/pages/` (routes)

---

## 5. Developer Experience (DX) & Environment Setup

### A. Installation Order

For a developer setting up their local workstation:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/organization/infraguard.git
    cd infraguard
    ```
2.  **Install Frontend Workspace Dependencies (Root):**
    ```bash
    npm install
    ```
3.  **Setup Backend Virtual Environment:**
    ```bash
    cd backend
    python -m venv .venv
    # Windows:
    .\.venv\Scripts\activate
    # macOS/Linux:
    source .venv/bin/activate
    pip install -r requirements.txt
    ```
4.  **Launch Local Development Servers:**
    ```bash
    # From project root
    npm run dev
    ```

### B. Terminal Commands & CLI Aliases

To reduce repetitive typing, configure the following aliases in your shell profile (`.bashrc`, `.zshrc`, or Microsoft.PowerShell_profile.ps1):

#### PowerShell (Windows):

```powershell
# Add to Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
function ig-dev { npm run dev }
function ig-verify { npm run verify }
function ig-clean { npm run clean }
function ig-unused { npm run unused }
```

#### Bash/Zsh (macOS/Linux):

```bash
# Add to ~/.bashrc or ~/.zshrc
alias ig-dev="npm run dev"
alias ig-verify="npm run verify"
alias ig-clean="npm run clean"
alias ig-unused="npm run unused"
```

---

## 6. Implementation & Transition Checklist

Follow this checklist to complete the developer experience transformation:

- [ ] Run `npm install` at the root level to pull ESLint, Prettier, TypeScript, and Knip plugins.
- [ ] Open the codebase in VS Code and verify that formatting occurs automatically when saving a file.
- [ ] Run `npm run lint` and review import order warnings; resolve by executing the automatic fix parameters.
- [ ] Run `npm run typecheck` to audit JavaScript type warnings.
- [ ] Run `npm run unused` to locate and review orphaned pages or components.
- [ ] Push a commit to verify that the GitHub Actions CI workflow triggers and passes successfully.
