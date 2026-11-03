---
name: vssw-run-script
description: >
  Use the project's ./run script for setup, serve, build and other project-level
  tasks — but only when the repository has an executable ./run at its root. Use
  this skill when asked to set up the project, install dependencies, start the
  dev server or build, in a repo that has ./run.
---

# Run Script Skill

Some projects wrap their tooling in a `./run` script at the root, so nobody has to remember whether this repo uses pnpm, Gradle, pip or mkdocs.

## 1. Check first
```sh
test -x ./run && ./run help 2>/dev/null || sed -n '1,40p' ./run
```

- **No `./run`:** this skill does not apply. Use the commands in the project's `CLAUDE.md` (for example `pnpm build`). Never invent a `./run` call.
- **`./run` exists:** read which subcommands it defines. Use only those.

## 2. Use it instead of the tools it wraps
When `./run` has the subcommand, call it rather than the underlying tool:

| Asked to… | Run |
|---|---|
| set up, install dependencies | `./run setup` |
| start the dev server, preview | `./run serve` |
| build for production | `./run build` |

Any other subcommand the script defines (`test`, `format`, `lint`) works the same way. Run it from the repo root.

## 3. Missing subcommand
If `./run` lacks what you need, say so and use the command from `CLAUDE.md`. Suggest adding it to `./run` rather than adding it yourself unasked.

## Smells
`./run build` in a repo with no `./run`, `pip install` or `pnpm install` run by hand where `./run setup` exists, a `./run` subcommand that `CLAUDE.md` doesn't mention.
