# VSSW Monorepo Context (Full-Stack)

Starting point for a full-stack monorepo's `CLAUDE.md`. Fill the placeholders and delete this line.

## Conventions

Follow the engineering constitution, vendored at `docs/constitution/`:

- `principles/README.md` — universal, apply always
- `patterns/README.md` — conditional, check "when not to use this"
- `technologies/README.md` — the default stack
- `documentation/README.md` — what to document, and where

Read the four index files at the start of a task. Open individual files when a
decision turns on them. Say so before deviating. Never edit the vendored copy —
change it upstream and pull.

Stack, architecture, API conventions, testing, formatting and repo layout are all
defined there. **Do not restate them here.** This file carries only what is
specific to *this* repository.

Process conventions the constitution does not cover — git workflow, squash and
merge, definition of done — are in the Playbook.

## This repository

- **What it does:** <one paragraph>
- **Layout:** <apps/*, packages/*, backend/ — what lives where>
- **Deliberate deviations:** <none yet — record each, with an ADR under docs/adr/>

## Commands

```bash
./run setup       # <verify every command before committing this file>
./run serve
./run build
```

## Gotchas

- <cross-cutting concerns: shared types, generated clients, the order things build in>

## Skills

Use the installed VSSW skills where they apply. Bootstrapping a new project:
`vssw-bootstrap-project`.
