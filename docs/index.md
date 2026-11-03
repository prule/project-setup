# Software Development Preferences & Guidelines

This is the entry point to the engineering playbook. **How code is built** — the stack, architecture, testing, formatting and quality gates — is defined once, in the [engineering constitution](./constitution/README.md) ([ADR 0001](./adr/0001-playbook-defers-to-the-engineering-constitution.md)). This page covers what the Playbook owns: how work is released, deployed and run.

### 📚 Engineering Playbook Index
For deep-dives into specific topics and conventions, please refer to our dedicated guides:

- [Clean Architecture](./constitution/patterns/hexagonal-architecture.md)
- [Clean Code Guidelines](./constitution/principles/README.md)
- [Code Review Guidelines](./CodeReview.md)
- [Git Workflow & Collaboration](./GitWorkflow.md) (and [Squash & Merge](./SquashAndMerge.md))
- [Feature Flags & Dark Launching](./FeatureFlags.md)
- [The Way of Working (Process & DoD)](./WayOfWorking.md)
- [Testing Strategy](./constitution/patterns/testing-strategy.md)
- [Quality Gates](./constitution/technologies/quality-gates.md)
- [API Design & Idempotency](./constitution/technologies/spring-boot-api.md)
- [Security Practices](./constitution/principles/least-privilege.md)
- [Data Privacy & Compliance](./Privacy.md)
- [Frontend State Management](./constitution/technologies/react-pwa.md)
- [Frontend Resilience & Offline Support](./constitution/technologies/frontend-resilience.md)
- [Styling & CSS Conventions](./constitution/technologies/react-pwa.md)
- [Accessibility (a11y)](./constitution/technologies/accessibility.md)
- [Timezones, Currency & Localization](./constitution/technologies/localization.md)
- [Performance & Optimization](./constitution/principles/measure-first.md)
- [Observability & Incident Response](./constitution/technologies/spring-boot-operations.md)
- [Third-Party Integrations (Build vs. Buy)](./Integrations.md)
- [Disaster Recovery & Backups](./DisasterRecovery.md)
- [Developer Onboarding (Day One)](./Onboarding.md)

---

## 1. Choosing the Stack

The constitution's [technologies decision tree](./constitution/technologies/README.md) picks the stack. In short: a **React PWA**, [local-first](./constitution/technologies/local-first.md) when it should work offline; **Supabase** as the default backend; **Kotlin + Spring Boot** only for a real domain model, batch work or heavy integration. Versions are pinned per project (`.node-version`, `packageManager`), not here.

---

## 2. Code Quality

Every change passes the [quality gates](./constitution/technologies/quality-gates.md): format, lint, types, tests with coverage, SonarQube via `sonar-check`, and Renovate for dependencies.

Code is formatted on commit — by **Husky** and **lint-staged** in a repo with a `package.json`, or by a native Git hook (`core.hooksPath`) in a JVM-only repo — set up with the `vssw-setup-git-hooks` skill, and checked again in CI. The formatters are in [Code Formatting](./constitution/technologies/formatting.md).

---

## 3. Releasing Schema Changes (Expand and Contract)

Several versions of the app can run at once during a deployment, so **every migration must work with both the old and the new code**. The migration tool and its rules — Supabase CLI with Row Level Security, or Flyway for Spring — are in [Supabase](./constitution/technologies/supabase.md), [Spring Boot & Kotlin](./constitution/technologies/spring-boot-kotlin.md) and the `vssw-generate-db-migration` skill.

A breaking change (renaming or dropping a column) spreads across deployments:

1. **Expand (Deployment 1):** Add the new column. The code writes to *both* columns and still reads the old one.
2. **Migrate (Deployment 2):** Backfill existing rows from the old column into the new one. The code now reads the *new* column.
3. **Contract (Deployment 3):** Once nothing reads or writes the old column, drop it.

---

## 4. CI/CD & Versioning

- **CI Provider:** GitHub Actions, running the quality gates on every pull request.
- **Merging:** [squash and merge](./SquashAndMerge.md), so one pull request is one commit on `main`.
- **Versioning:** the version is derived from git history at build time — `<major>.<commits on main>.0` — so each squash-merge bumps it by exactly one, and no version number is ever written on a branch. Only the major is maintained by hand.
- **Unified Monorepo Versioning:** a frontend and backend in one repository share that one version.
- The version is visible in the app UI (e.g. the footer or settings page) and returned by the backend's version endpoint.

---

## 5. Deployment & Analytics

- **Hosting:** Deploy frontend applications to **Cloudflare Pages** ([Cloudflare](./constitution/technologies/cloudflare.md)).
- **Analytics:** Cloudflare Web Analytics.
    - Use the "Auto" integration method from the Cloudflare Dashboard (Cloudflare Dashboard → Pages project → Metrics tab → enable Web Analytics). This requires zero code and no tokens.
    - **Privacy Advantage:** Cloudflare Web Analytics is privacy-first. It does not use client-side state (like cookies or `localStorage`) to track users across sites or collect personal data. Therefore, it **does not require a GDPR cookie banner** or tracking consent prompt, keeping the UI clean and legally compliant by default.
- **Legal/Privacy:** Ensure a privacy page exists (e.g., `https://portfolio.vamonossoftware.com/privacy`).

---

## 6. Forms, Feedback & Landing Pages

Avoid heavy backend setups just for form collection. A **feedback** form or a **register interest** form on a landing page posts to a Google Form from the app's own UI, so answers land in a Google Sheet and the user never sees the Google Form. The `vssw-integrate-google-form` skill builds it, sending only the data the form needs. See [Third-Party Integrations](./Integrations.md) for when buying beats building.

---

## 7. Observability

Logging, tracing, metrics and health checks for a service are in [Spring Boot Operations](./constitution/technologies/spring-boot-operations.md).

---

## 8. Developer Experience (DX)

### Project commands
The project's `CLAUDE.md` lists the exact commands to set up, run, test and build it, and every one of them has been run. A repository may also wrap them in a `run` shell script at its root (`./run setup`, `./run serve`, `./run build`) as executable documentation; when it has one, use it rather than the tools it wraps (the `vssw-run-script` skill). It is optional: `pnpm` scripts or Gradle tasks listed in `CLAUDE.md` are enough.
