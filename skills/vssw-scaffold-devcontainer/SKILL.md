---
name: vssw:scaffold-devcontainer
description: >
  Use this skill whenever the user asks to add, set up, standardise, or align a
  Dev Container (devcontainer) for a project — a reproducible, zero-host-setup
  development environment. Covers Node (via fnm), pnpm (standalone), OpenSpec,
  Java/Gradle, Playwright, Claude Code, and the shared pnpm/Gradle caches.
---

# Scaffold a VSSW-standard Dev Container

Produce a Dev Container matching the VSSW standard (see `docs/DevContainers.md`
in the playbook): **Node via fnm** (never corepack), **pnpm installed
standalone**, the **OpenSpec CLI**, **Claude Code + GitHub CLI** as Features, and
a **shared pnpm/Gradle cache** across every dev container on the machine. It
produces three files in `.devcontainer/`: `Dockerfile`, `devcontainer.json`,
`post-create.sh` — start from the `templates/` next to this skill.

## 1. Detect the stack and read the pins

Gather these from the repo before writing anything:

- **App location**: is the app at the repo root, or in a subdir (`app/`,
  `frontend/`)? There may be MORE than one pnpm project (e.g. `frontend/` +
  `landing/`) — each needs its own install.
- **Node version**: `.node-version` or `.nvmrc` (fnm reads either). → `NODE_VERSION`.
- **pnpm version**: `package.json` → `packageManager` (`pnpm@X.Y.Z`). → `PNPM_VERSION`.
- **Backend**: is there `build.gradle(.kts)` / `gradlew` / Kotlin? → needs a JDK
  and a Gradle warm. Find the JDK version (`jvmToolchain(N)` / `JavaLanguageVersion`).
- **Nested Docker**: does the app run a local stack of containers (Supabase,
  Testcontainers)? → needs `docker-in-docker` + `--privileged`.
- **Ports**: dev server, preview, backend, DB/Studio, etc.
- **Git hooks**: `.githooks` + `core.hooksPath`, or husky (`prepare` script).
- **OpenSpec**: an `openspec/` dir or `.claude/skills/openspec-*` confirms the
  CLI is needed (it is, for those skills to work).

## 2. Choose the base image

| Stack | `BASE_IMAGE` | Notes |
| --- | --- | --- |
| Frontend only | `mcr.microsoft.com/devcontainers/base:debian-12` | |
| Kotlin/Gradle backend (+ frontends) | `mcr.microsoft.com/devcontainers/java:1-<JDK>-bookworm` | JDK from the base; **also uncomment the yarn-apt-source removal** in the Dockerfile |
| docker-in-docker / Supabase | `mcr.microsoft.com/devcontainers/base:ubuntu-24.04` | |

Layer JDK via the `java` Feature ONLY if the base isn't already a java image.

## 3. Write the three files

Copy `templates/{Dockerfile,devcontainer.json,post-create.sh}` into
`.devcontainer/` and replace the `{{PLACEHOLDERS}}`: `PROJECT_NAME`,
`BASE_IMAGE`, `NODE_VERSION`, `PNPM_VERSION`, `PORTS`, `NODE_VERSION_FILE`.
Then apply the stack-specific edits the template comments call out:

- **Kotlin/Gradle**: uncomment the yarn-source removal (java base); add the
  `GRADLE_USER_HOME=/cache/gradle` env; add the `/cache/gradle` chown; add the
  `./gradlew classes testClasses --parallel` warm; JetBrains backend `IntelliJ`.
- **docker-in-docker**: add the dind Feature, `--privileged`, and a
  `<name>-dind` volume at `/var/lib/docker`; install any CLI the stack needs
  (e.g. Supabase) in post-create.
- **App in a subdir / multiple pnpm projects**: run the install (and Playwright)
  in each project dir; the shared-store setting is global (set once).
- **Optional credential persistence**: add `<name>-claude` → `~/.claude` and
  `<name>-gh` → `~/.config/gh` volumes (chown them in post-create) so `claude`
  and `gh` logins survive rebuilds.
- Trim VS Code extensions / JetBrains backend to what the project actually uses.

Make `post-create.sh` executable (`chmod +x`).

## 4. Non-negotiables — these fail SILENTLY if you deviate

1. **OpenSpec package is `@fission-ai/openspec`.** The bare `openspec` on npm is
   an empty 0.0.0 placeholder with no binary. Install via `npm i -g` (into the
   fnm Node's bin), not pnpm.
2. **Never mount a volume at `~/.local/share/pnpm` (PNPM_HOME)** — it shadows the
   standalone pnpm baked into the image. The store lives in `/cache`, not there.
3. **pnpm store-dir can only be set via `pnpm config set --global`** (pnpm
   ignores `PNPM_STORE_DIR`/`.npmrc`), run from `$HOME` (else a stray
   `.pnpm-store` lands in the repo), and the install needs `CI=true` (no-TTY
   purge). The shared volume MUST be named `devcontainer-cache` at `/cache`.
4. **Chown `~/.cache` before anything writes to it.** Mounting the Playwright
   volume makes Docker create `~/.cache` root-owned; put the whole ownership
   block first in post-create.
5. **java base image**: remove `/etc/apt/sources.list.d/yarn.list` — its expired
   key breaks `apt-get update` and thus Playwright `--with-deps`.
6. **Fixed `--name`**: only one orchestrator can own it; a stale container 409s a
   rebuild — recover with `docker rm -f <name>-dev`.

## 5. Build and verify (actually run these)

Use the devcontainer CLI (`npm i -g @devcontainers/cli` if missing). A fixed
`--name` won't be matched by `up`, so clear any stale one first:

```bash
docker rm -f {{PROJECT_NAME}}-dev 2>/dev/null || true
devcontainer up --workspace-folder .
```

Then, inside the container (`devcontainer exec --workspace-folder . bash -ic '…'`
— use an INTERACTIVE shell so `.bashrc`/fnm are sourced):

- `node --version` / `pnpm --version` match the pins; `openspec --version` is 1.6.x.
- `gh`, `claude` resolve; `java -version` (if applicable); nested `docker run hello-world` (if dind).
- **Shared store used**: `pnpm store path` → `/cache/pnpm-store/v...`, and
  `node_modules/.modules.yaml` records that `storeDir`. No `.pnpm-store` in the repo.
- The project's own **lint / build / unit tests** pass; Chromium launches.
- Then `docker rm -f {{PROJECT_NAME}}-dev` so the IDE owns the container.

If a build fails with `SQLite disk I/O error` or similar, check Docker Desktop's
disk — `docker system df`; reclaim with `docker builder prune -af` and
`docker image prune -af` (these don't touch named volumes).

## 6. Commit

Branch, then commit `.devcontainer/*` (+ `devcontainer-lock.json`, + a README/doc
if updated). Squash-merge per the Git Workflow playbook. Note in the PR that the
change needs a **dev container rebuild** to take effect.
