---
name: vssw-audit-project-compliance
description: >
  Audits the current project against the engineering constitution and Playbook
  standards. Use this skill whenever asked to "audit the project",
  "check compliance", "find what's missing", or to check a project follows
  the standards or constitution.
---

# Audit Project Compliance Skill

Run all three phases before prompting the user for anything.

## Phase 1: Detect the project

- **Frontend** — `package.json` with React/Vite.
- **Backend (Spring)** — Kotlin/Gradle files.
- **Backend (Supabase)** — a `supabase/` folder (the constitution's default backend).
- **Monorepo** — more than one of these.

Then read `docs/constitution/README.md` if it is vendored, and the project's `CLAUDE.md`. A project may record a **deliberate deviation** — in `CLAUDE.md`, `openspec/config.yaml`, or an ADR under `docs/adr/`. A recorded deviation is **compliant**: report it as ⚠️ *recorded*, not ❌. Only unrecorded departures are failures.

## Phase 2: Scan

### Constitution
1. Is `docs/constitution/` vendored (git subtree), and does `CLAUDE.md` point at its four index READMEs?
2. Does `CLAUDE.md` state that the vendored copy must never be edited locally?
3. Is `docs/constitution/` **unmodified** vs upstream? (`git log --oneline -- docs/constitution` should show only subtree commits.)
4. Is it excluded from the formatter and the linter?

### Global
5. **Git hooks** — does `.githooks/pre-commit` exist, is it executable, and is `core.hooksPath` registered (in `./run setup`, or documented as a per-clone step)?
6. Does the hook format **only staged files**, and avoid `git add .`?
7. **CI** — does `.github/workflows` run format, lint, typecheck and tests? *(The hook is convenience; CI is enforcement — `--no-verify` exists.)*
8. **Specs** — does `openspec/` exist, and does `config.yaml` have a `context` block that points at the constitution rather than restating the stack? Any `<placeholders>` left unfilled?
9. **Decisions** — does `docs/adr/` exist for anything costly to reverse?

### Frontend
10. **pnpm** — `pnpm-lock.yaml` present, and no `package-lock.json` or `yarn.lock`.
11. **Versions pinned** — `.node-version` **and** `packageManager` in `package.json`. Both, exactly.
12. **Formatter and linter** — Prettier, and oxlint with its `correctness` rules and the React hooks rules as errors (`technologies/quality-gates.md`). ESLint only as a recorded deviation, and then with `eslint-config-prettier` last.
13. **TypeScript** — `strict: true`; grep for `any`, `@ts-ignore`, `as unknown as`.
14. **PWA** — manifest, maskable icon, service worker, offline fallback.
15. **E2E** — Playwright using **Serenity/JS** Screenplay; no `page.` calls in specs.
16. **Accessibility** (`technologies/accessibility.md`) — native elements over `div` buttons, every input labelled, an automated axe check (`@axe-core/playwright`) in the e2e journeys.
17. **Resilience** (`technologies/frontend-resilience.md`) — an error boundary at the app root, retries on GET only, and loading / empty / error states on data views.
18. **Localization** (`technologies/localization.md`) — times stored in UTC, money as integer minor units, user-facing strings not concatenated from fragments.

### Backend (Supabase) (`technologies/supabase.md`)
19. **Row Level Security** — every table in `supabase/migrations/` has `enable row level security` and at least one policy, in the migration that creates it. A table without it is a data-exposure ❌, ranked first.
20. **Schema in the repo** — every schema change is a migration file; no drift between `supabase db diff` and the migrations (run it if the local stack is up, else say so under *not checked*).
21. **Keys** — no `service_role` key in frontend code or committed `.env` files.

### Backend (Spring)
22. **Ports and adapters** — does `domain`/`application` import from `adapters`, `config`, or Spring? Is there an **ArchUnit test** enforcing it?
23. **Contract first** — is `openapi.yaml` the source, with generated server interfaces? (A spec generated *from* annotations is a ❌.)
24. **Persistence** — Spring Data JDBC, Flyway forward-only, **no edited migrations**.
25. **Tests** — Testcontainers against real Postgres, **not H2**. Slices (`@DataJdbcTest`, `@WebMvcTest`) rather than `@SpringBootTest` everywhere.
26. **API** — RFC 9457 Problem Details, HATEOAS `_links`, pagination on every collection, idempotency keys on unsafe POSTs.
27. **Operations** — Actuator readiness/liveness, timeouts on every outbound call, secrets from the environment and not in `application.yml`.

### Quality gates (`technologies/quality-gates.md`)
Skip 29–30 for a repo with no application code (a blog, a docs site) only if that is recorded.

28. **Lint in CI** — oxlint (frontend) or detekt (backend) runs in `.github/workflows` and in `CLAUDE.md`'s done-check. Run it: any warning left must be a planned change, not drift.
29. **Coverage report** — a script writes lcov (`vitest run --coverage`) or JaCoCo XML, and `coverage/` (or the build dir) is git-ignored.
30. **SonarQube** — a root `sonar-project.properties` names sources, tests and the coverage report path; `sonar-check` is the last item of `CLAUDE.md`'s done-check, after the coverage run; and the project has a baseline on the server (`curl -su "$(cat ~/.config/sonar/token):" "localhost:9000/api/projects/search?projects=<key>"` returns it). Server down or no token: say so under *not checked*.
31. **Suppressions** — grep `NOSONAR`, `oxlint-disable`, `eslint-disable`, `@Suppress`: each needs a reason on the same line.
32. **Renovate** — `renovate.json` extends `config:recommended` and pins GitHub Action digests; dependencies are exact, not ranges.

## Phase 3: Report

Write `project_audit_report.md`:

- ✅ / ⚠️ *recorded deviation* / ❌ per criterion, grouped by the sections above.
- **Order the ❌s by consequence, not by list position.** An unrecorded security or data-loss gap (secrets committed, no RLS, an edited migration, a retried payment that double-charges) outranks a missing config file.
- For each ❌, give the exact command or skill that fixes it — e.g. *"run the `vssw-setup-git-hooks` skill"*, *"run `pnpm add -D prettier`"*.
- For each ⚠️, name where the deviation is recorded so the user can confirm it still holds.
- State what you could **not** check and why. A criterion you skipped is not a pass.
