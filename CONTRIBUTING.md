# Contributing to InfraGuard

We welcome contributions to InfraGuard! To maintain software stability and quality, please follow the guidelines below.

## Development Workflow

1.  **Branching Strategy:** Create a topic branch from `main` using standard naming conventions:
    - `feature/feature-name`
    - `bugfix/issue-description`
    - `docs/documentation-update`
2.  **Coding Standards:**
    - **Frontend:** Follow functional React component standards. Use isolated custom hooks for state management and DOM manipulation. Ensure styling is clean, custom, and responsive.
    - **Backend:** Write modular Python using Flask blueprints. Keep database interactions decoupled under the `backend/app/database/` repository domains.
3.  **Linting & Verification:** Before creating a Pull Request, run the local verification checks:
    ```powershell
    # Format and lint check
    npm run format
    npm run lint

    # Compile type-safety checks
    npm run typecheck

    # Verify build artifact compilation
    npm run build:frontend
    ```

## Pull Request Guidelines

- Ensure any new features include equivalent test suites under `tests/`.
- Maintain the Architecture Decision Records (ADRs) if changing APIs or core systems.
- Document changes in the next release notes preview.
