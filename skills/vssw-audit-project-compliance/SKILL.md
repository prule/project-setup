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
- **Backend** — Kotlin/Gradle files.
- **Monorepo** — both.

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
12. **Formatter and linter** — Prettier and ESLint configured, with `eslint-config-prettier` last.
13. **TypeScript** — `strict: true`; grep for `any`, `@ts-ignore`, `as unknown as`.
14. **PWA** — manifest, maskable icon, service worker, offline fallback.
15. **E2E** — Playwright using **Serenity/JS** Screenplay; no `page.` calls in specs.

### Backend
16. **Ports and adapters** — does `domain`/`application` import from `adapters`, `config`, or Spring? Is there an **ArchUnit test** enforcing it?
17. **Contract first** — is `openapi.yaml` the source, with generated server interfaces? (A spec generated *from* annotations is a ❌.)
18. **Persistence** — Spring Data JDBC, Flyway forward-only, **no edited migrations**.
19. **Tests** — Testcontainers against real Postgres, **not H2**. Slices (`@DataJdbcTest`, `@WebMvcTest`) rather than `@SpringBootTest` everywhere.
20. **API** — RFC 9457 Problem Details, HATEOAS `_links`, pagination on every collection, idempotency keys on unsafe POSTs.
21. **Operations** — Actuator readiness/liveness, timeouts on every outbound call, secrets from the environment and not in `application.yml`.

## Phase 3: Report

Write `project_audit_report.md`:

- ✅ / ⚠️ *recorded deviation* / ❌ per criterion, grouped by the sections above.
- **Order the ❌s by consequence, not by list position.** An unrecorded security or data-loss gap (secrets committed, no RLS, an edited migration, a retried payment that double-charges) outranks a missing config file.
- For each ❌, give the exact command or skill that fixes it — e.g. *"run the `vssw-setup-git-hooks` skill"*, *"run `pnpm add -D prettier`"*.
- For each ⚠️, name where the deviation is recorded so the user can confirm it still holds.
- State what you could **not** check and why. A criterion you skipped is not a pass.
