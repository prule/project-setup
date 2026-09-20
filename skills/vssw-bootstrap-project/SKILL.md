---
name: vssw-bootstrap-project
description: >
  Bootstraps a new project from an empty folder: git, OpenSpec, the engineering
  constitution vendored as a git subtree, a wired openspec/config.yaml, and a
  CLAUDE.md. Use whenever asked to start, scaffold, bootstrap or set up a new
  project, to initialise OpenSpec in a project, or to pull in the constitution
  or engineering standards.
---

# Bootstrap a Project

Takes an empty (or nearly empty) folder to a project ready for spec-driven work.

Run the steps in order — step 3 fails without step 1's commit.

## 1. Git, with a first commit

```sh
git init -b main
git commit --allow-empty -m "Initial commit"
```

The empty commit is **required**: `git subtree add` on a repo with no commits fails with the misleading error `working tree has modifications. Cannot add.`

## 2. Initialise OpenSpec

```sh
openspec init --tools claude --no-animation
```

Creates `openspec/{specs,changes,config.yaml}` plus `.claude/commands/opsx/` and `.claude/skills/openspec-*`. The generated `config.yaml` is **entirely commented out** — step 4 writes it, it does not edit it.

## 3. Vendor the constitution

```sh
git remote add constitution git@github.com:prule/principles.git
git subtree add --prefix docs/constitution constitution main --squash
```

Subtree, not submodule: the files are then always present. A submodule is silently absent after a clone without `--recursive`, so `CLAUDE.md` points at paths that do not exist and the agent proceeds ungoverned while appearing governed.

Update later with:
```sh
git subtree pull --prefix docs/constitution constitution main --squash
```

## 4. Write `openspec/config.yaml`

The `context` block is injected into every artefact the agent creates. It holds **only what is true of this product** — the constitution owns the stack, testing, conventions and deployment. Full rules: `docs/constitution/documentation/openspec-config.md`.

```yaml
schema: spec-driven

context: |
  Conventions: follow `docs/constitution/` — principles, patterns, technologies,
  documentation. Read its four index READMEs before creating artifacts. This
  block adds only what is specific to this product.
  (Restated because it is critical and easily got wrong: pnpm for everything —
  never npm or yarn.)

  Product: <one paragraph — what it is, who it is for, what problem it solves>

  Core capabilities:
  - <capability>

  Domain model:
  - <entity: { field, field }>

  Deliberate exceptions to the constitution defaults:
  - <none yet — record each departure, why, and the file it departs from>

rules:
  proposal:
    - <what every proposal for this product must state>
  tasks:
    - <what every task list for this product must cover>
```

**Fill in every `<placeholder>` by asking the user.** Never leave them in the file — an unfilled placeholder is injected into every artefact from then on. Delete `rules:` entirely rather than shipping placeholder rules.

## 5. Write `CLAUDE.md`

Keep it under ~50 lines; it loads on every task. Only commands you have actually run.

```markdown
# <Project>

<One or two sentences: what this is and who it is for.>

## Commands

​```bash
<verified command>   # what it does
​```

## Conventions

Follow the engineering constitution in `docs/constitution/`:

- `principles/README.md` — universal, apply always
- `patterns/README.md` — conditional, check "when not to use this"
- `technologies/README.md` — the default stack
- `documentation/README.md` — what to document, and where

Read the four index files at the start of a task. Open individual files when a
decision turns on them. Say so before deviating.

`docs/constitution/` is vendored from github.com/prule/principles — **never edit
it here.** Change it upstream and pull.

## Specs

`openspec/` holds the specs and change proposals. Behaviour is specified before
it is implemented — see `docs/constitution/documentation/specs.md`.

## Deviations from the constitution

None yet. Record each one here and in `openspec/config.yaml`, with an ADR under
`docs/adr/` for anything costly to reverse.
```

## 6. Stack and tooling

Scaffold per `docs/constitution/technologies/README.md` — its decision tree picks the stack. For anything Node or browser:

- `.node-version` pinned to an exact version (fnm reads it)
- pnpm pinned via `packageManager` in `package.json` — never npm or yarn
- Prettier and ESLint, with `eslint-config-prettier` last
- Add `docs/constitution/` to `.prettierignore` and the ESLint `ignores` — **the vendored copy must never be reformatted or linted**

Then set up formatting on commit with the **vssw-setup-git-hooks** skill, and add a CI workflow running format, lint, typecheck and tests. The hook is convenience; CI is enforcement.

## 7. Commit

```sh
git add -A
git commit -m "Bootstrap project with OpenSpec and the engineering constitution"
```

## Checklist

- [ ] `git log` shows the initial commit plus the subtree commits
- [ ] `docs/constitution/README.md` exists and is populated
- [ ] `openspec/config.yaml` parses and has **no `<placeholders>` left**
- [ ] `CLAUDE.md` exists, and every command in it has been run
- [ ] `docs/constitution/` is excluded from formatter and linter
- [ ] The user has confirmed the product description you wrote
