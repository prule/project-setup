# VSSW Frontend Context (React PWA)

Starting point for a frontend project's `CLAUDE.md`. Fill the placeholders and delete this line.

## Conventions

Follow the engineering constitution, vendored at `docs/constitution/`:

- `principles/README.md` — universal, apply always
- `patterns/README.md` — conditional, check "when not to use this"
- `technologies/README.md` — the default stack
- `documentation/README.md` — what to document, and where

Read the four index files at the start of a task. Open individual files when a
decision turns on them. Say so before deviating. Never edit the vendored copy —
change it upstream and pull.

The stack, PWA setup, local-first storage, accessibility, resilience, testing and
formatting are all defined there. **Do not restate them here.** This file carries
only what is specific to *this* application.

## This application

- **What it does:** <one paragraph>
- **Local data:** <what is stored on the device, and the conflict rule>
- **Deliberate deviations:** <none yet — record each, with an ADR under docs/adr/>

## Commands

```bash
pnpm dev          # <verify every command before committing this file>
pnpm test         # unit
pnpm test:e2e     # Playwright, Serenity/JS Screenplay
pnpm lint
pnpm format
```

## Gotchas

- <the design system, the fixture data, the generated files>

## Skills

Use the installed VSSW skills where they apply:
`vssw-scaffold-playwright-screenplay-test`, `vssw-integrate-google-form-feedback`,
`vssw-integrate-google-form-register-interest`, `vssw-setup-git-hooks`,
`vssw-audit-project-compliance`.
