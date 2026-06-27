# Software Development Preferences & Guidelines

This document serves as the core entrypoint for our engineering playbook. It covers high-level architecture choices, tooling, and deployment strategies.

### 📚 Engineering Playbook Index
For deep-dives into specific topics and conventions, please refer to our dedicated guides:
- [Clean Architecture](./CleanArchitecture.md)
- [Clean Code Guidelines](./CleanCode.md)
- [Git Workflow & Collaboration](./GitWorkflow.md) (and [Squash & Merge](./SquashAndMerge.md))
- [Testing Strategy](./TestingGuide.md)
- [API Design & Idempotency](./ApiDesign.md)
- [Security Practices](./Security.md)
- [Frontend State Management](./StateManagement.md)
- [Performance & Optimization](./Performance.md)
- [Observability & Incident Response](./Observability.md)

---

## 1. Architectural Paradigms

When starting a new project, evaluate if it needs a full backend or if a local-first approach is sufficient.

### Local-First PWA (Default for standalone apps)
- **Concept:** App runs entirely in the browser, storing data locally. No custom backend required.
- **Storage:** Local storage using **IndexedDB**, managed via the **Dexie.js** wrapper.
- **Use Case:** Single-user tools, calculators, offline-first utilities, or apps where data privacy means data shouldn't leave the device.

### REST API Backend (For distributed/multiplayer apps)
- **Concept:** Client-server architecture where the frontend communicates with a remote backend.
- **Use Case:** Multi-user platforms, centralized data processing, or when integrating with external webhooks/services.

---

## 2. Frontend Stack & Setup

All frontend projects should utilize the following core stack:
- **Framework:** React + TypeScript.
- **Build Tool:** Vite.
- **Package Manager:** PNPM (Node 24 required). PNPM ensures efficient and fast `node_modules` storage.
- **PWA Integration:** Use `vite-plugin-pwa` with `generateSW` to configure the service worker. Implement the prompt-for-update behavior when code is updated.
- **State Management & Fetching:** 
  - **TanStack Query (React Query)** for async state and data fetching.
  - **Zustand** or **React Context** for purely local UI state.
- **Styling:** Tailwind CSS.
- **Component Architecture:** Focus on clean code and highly reusable components. Always use the latest stable package versions.

### Frontend Testing
- **Unit/Integration Tests:** Vitest.
- **E2E Tests:** Playwright combined with **Serenity BDD**.
  - Must use the **Screenplay Pattern**.
  - Enable Serenity Reports for clear, business-readable test documentation.

---

## 3. Backend Stack (If Required)

If the project requires a REST API, adhere to these standards:
- **Language:** Kotlin.
- **Architecture:** Hexagonal / Clean Architecture.
- **Framework & Database:**
  - **Spring Boot with JPA** backed by **PostgreSQL** (Default choice for standard and enterprise apps).
  - **Ktor with Exposed** backed by **PostgreSQL** (Alternative for lightweight, high-performance microservices).
  - **Supabase** (Alternative Backend-as-a-Service option providing PostgreSQL, auth, and real-time APIs).
- **API Design & Requirements:**
  - Standardized with **OpenAPI**.
  - Implement **HATEOAS** links in resource responses, dynamically adjusting based on resource state and user permissions.
  - **Version Endpoint:** Backends must expose an endpoint returning the application version (e.g., via Spring Boot Actuator).

---

## 4. Database Migrations & Data Modeling

For projects requiring a PostgreSQL backend, database schemas and migrations are managed as follows:

- **Migration Tool:** Flyway.
- **Execution Strategy:** Migrations must be applied automatically on application startup (e.g., via Spring Boot's native Flyway integration) to ensure the database schema is always in sync with the application code.
- **Data Modeling Conventions:**
  - Use `snake_case` for all table and column names.
  - Use plural names for tables (e.g., `users`, `orders`).
  - Use explicit UUIDs as primary keys by default.
  - All tables must include `created_at` and `updated_at` timestamp columns for auditing purposes.

### Zero-Downtime Migrations (Expand and Contract Pattern)
Because multiple instances of the backend may be running simultaneously during a deployment, **all database migrations must be backwards compatible**. A new version of the application might run alongside the old version for several minutes during a rolling update.

If you need to make a breaking change (like renaming or dropping a column), you must use the **Expand and Contract** pattern spread across multiple deployments:
1. **Expand (Deployment 1):** Add the new column. Update the application code to write to *both* the old and new columns, but continue reading from the old column.
2. **Migrate (Deployment 2):** Run a migration to backfill existing data from the old column into the new column. Update the application code to read from the *new* column.
3. **Contract (Deployment 3):** Once all running instances are using the new column and no code relies on the old one, you can safely drop the old column from the database.

---

## 5. Git Hooks & Code Formatting

Code must be automatically formatted on commit using **Husky** and **lint-staged**.

- **JavaScript/TypeScript:** ESLint & Prettier.
- **Kotlin:** `ktfmt` (configured via Gradle plugin).
- **Java:** `google-java-format` (configured via Gradle plugin).

*Ensure the Git hook triggers the relevant Gradle formatting tasks before allowing a commit.*

---

## 6. CI/CD & Versioning

- **CI Provider:** GitHub Actions (GitHub CI).
- **Dependency Management:** Use **Renovate** to automatically keep dependencies up to date.
- **Versioning Strategy:**
  - **Unified Monorepo Versioning:** If the frontend and backend reside in the same repository, they should share the exact same version number (Lockstep Versioning). A single global version is bumped for the entire repository regardless of which files changed.
  - A custom GitHub Action should bump the **minor version** (e.g., triggering `npm version minor` and updating `gradle.properties` / `build.gradle.kts`) on every merge to the `main` branch.
  - The unified version number must be visible within the app UI (e.g., footer or settings page) and returned by the backend version endpoint.

---

## 7. Deployment & Analytics

- **Hosting:** Deploy frontend applications to **Cloudflare Pages**.
- **Analytics:** Cloudflare Web Analytics.
  - Use the "Auto" integration method from the Cloudflare Dashboard (Cloudflare Dashboard → Pages project → Metrics tab → enable Web Analytics). This requires zero code and no tokens.
  - **Privacy Advantage:** Cloudflare Web Analytics is privacy-first. It does not use client-side state (like cookies or `localStorage`) to track users across sites or collect personal data. Therefore, it **does not require a GDPR cookie banner** or tracking consent prompt, keeping the UI clean and legally compliant by default.
- **Legal/Privacy:** Ensure a privacy page exists (e.g., `https://portfolio.vamonossoftware.com/privacy`).

---

## 8. Forms, Feedback & Landing Pages

Avoid heavy backend setups just for form collection. Instead, leverage Google Sheets:
- **Feedback Page:** Collect user comments by submitting data to a Google Sheet. Use the "prefilled Google Form" URL submission trick to handle the backend without the user ever seeing the actual Google Form interface.
- **Landing Page:** Use the same Google Sheet/Form technique to build a "Register Interest" form for pre-launch products.

---

## 9. Observability & Logging

- **Logging:** Implement structured, contextual logging. Include unique trace IDs (e.g., using MDC in Kotlin/Java) to follow requests throughout their lifecycle.
- **Monitoring:** Collect key application and performance metrics.
- **Tracing:** Ensure observability tools are properly integrated to monitor errors, performance, and API traffic.

---

## 10. Developer Experience (DX)

### The `run` Script
Every repository must contain a `run` shell script in its root directory.
- **Purpose:** Acts as executable documentation.
- **Functionality:** Automates all relevant developer commands (e.g., `./run app:build`, `./run db:up`).
- **Benefit:** Developers don't need to memorize complex CLI arguments, and the script inherently documents how to set up and work within the environment.
