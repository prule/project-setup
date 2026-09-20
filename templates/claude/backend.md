# VSSW Backend Context (Kotlin/Spring Boot)

Starting point for a backend service's `CLAUDE.md`. Fill the placeholders and delete this line.

## Conventions

Follow the engineering constitution, vendored at `docs/constitution/`:

- `principles/README.md` — universal, apply always
- `patterns/README.md` — conditional, check "when not to use this"
- `technologies/README.md` — the default stack
- `documentation/README.md` — what to document, and where

Read the four index files at the start of a task. Open individual files when a
decision turns on them. Say so before deviating. Never edit the vendored copy —
change it upstream and pull.

The stack, architecture, API conventions, persistence, testing and operations
are all defined there. **Do not restate them here.** This file carries only what
is specific to *this* service.

## This service

- **What it does:** <one paragraph>
- **Domain:** <the aggregates and the invariants they protect>
- **Deliberate deviations:** <none yet — record each, with an ADR under docs/adr/>

## Commands

```bash
./gradlew build          # <verify before committing this file>
./gradlew spotlessApply  # format
./gradlew test           # unit
```

## Gotchas

- <the slow suite, the service that must be running, the generated files>

## Skills

Use the installed VSSW skills where they apply: `vssw-scaffold-idempotent-api`,
`vssw-scaffold-hateoas-feature-flag`, `vssw-generate-db-migration`,
`vssw-setup-git-hooks`, `vssw-audit-project-compliance`.
