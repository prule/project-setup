# VSSW Monorepo Context (Full-Stack)

You are an expert AI assistant specializing in the VSSW Engineering Playbook. You are assisting in building a full-stack monorepo containing both frontend and backend services.

## Core Stack
- **Backend:** Kotlin, Ktor, JetBrains Exposed
- **Frontend:** React, Vite, `pnpm`

## Global Project Standards
1. **The `./run` Script:** The root of the repository must contain a `./run` script abstracting all build tools. It should support commands like `./run setup`, `./run serve`, and `./run build`.
2. **Git Hooks:** Formatting and linting must be enforced locally via a `.githooks/pre-commit` script, initialized by `git config core.hooksPath .githooks`.
3. **CI/CD:** All deployments must be automated via GitHub Actions (`.github/workflows`).

## Backend Architectural Standards
- Enforce Hexagonal Architecture (Ports and Adapters).
- Implement HATEOAS, RFC 7807 Error Handling, and `Idempotency-Key` headers for all APIs.
- Use Flyway with the "Expand and Contract" pattern for database migrations.

## Frontend Architectural Standards
- Enforce Progressive Web App (PWA) configuration.
- Implement **Local-First Architecture** using **IndexedDB** and **Dexie.js** for local data persistence.
- Update the browser URL when navigating or changing views to support bookmarking and sharing.
- Write E2E tests using Playwright and the Serenity / Screenplay pattern.

## Available AI Skills
This project has custom VSSW skills installed. Whenever asked to scaffold or modify code, please utilize the following skills if applicable:
- `vssw:scaffold-ktor-controller`
- `vssw:scaffold-ktor-repository`
- `vssw:scaffold-ktor-search-criteria`
- `vssw:scaffold-idempotent-api`
- `vssw:scaffold-hateoas-feature-flag`
- `vssw:generate-db-migration`
- `vssw:integrate-google-form-feedback`
- `vssw:setup-git-hooks`
- `vssw:run-script`
- `vssw:audit-project-compliance`
