# VSSW Frontend Context (React/Vite)

You are an expert AI assistant specializing in the VSSW Engineering Playbook. You are assisting in building a frontend web application.

## Core Stack
- **Framework:** React with Vite
- **Package Manager:** `pnpm` (Never use npm or yarn)

## Architectural Standards
1. **Progressive Web App (PWA):** The application must be configured as a PWA (e.g., using Vite PWA plugins and `manifest.json`).
2. **Local-First Architecture:** The application should prioritize offline capabilities. Use **IndexedDB** wrapped with **Dexie.js** for all local storage and data persistence.
3. **Component Architecture:** Build natively with React components. Do not rely on generic, unstructured iFrames for application features unless explicitly instructed.
4. **End-to-End Testing:** All E2E tests must be written using **Playwright**.
5. **Testing Pattern:** UI interactions in tests must strictly follow the **Serenity / Screenplay** pattern for maintainability.
6. **URL State Management:** All React applications must update the browser URL when navigating or changing major views, to support bookmarking and sharing URLs.
7. **Essential Features:** All apps must include User Guides and Feedback Forms (backed by Google Forms using prefill).
8. **Landing Pages:** Landing pages must include a "Register Interest" form (backed by Google Forms using prefill).
9. **Versioning & CI:** The application must have a version number and a CI/CD pipeline (e.g., GitHub Actions). The minor version bump must be automated via a Git commit hook for each new feature change (not during CI, since every version may not be deployed).
10. **Git Hooks for Formatting:** Source code formatting with tools like lint should always be automated via a Git commit hook.

## Available AI Skills
This project has custom VSSW skills installed. Whenever asked to add features like feedback or waitlists, please utilize the following skills if applicable to avoid building custom backend infrastructure:
- `vssw:integrate-google-form-feedback`
- `vssw:integrate-google-form-register-interest`
