# Dev Containers

Every project ships a [Dev Container](https://containers.dev) so you get an
identical, fully-provisioned environment in **VS Code**, **IntelliJ IDEA**, and
**WebStorm** — with no host setup beyond Docker and an editor. The container
matches CI and the deploy target exactly, so "works on my machine" stops being a
category of bug.

To scaffold or align a project to this standard, use the
[`vssw-scaffold-devcontainer`](AISkills.md) AI skill — it carries the templates
and the checklist below.

## The standard toolchain

| Piece | How it's provided | Why |
| --- | --- | --- |
| **Node** | **fnm**, driven by `.node-version` / `.nvmrc` | **Not corepack** (deprecated / dropped in newer Node); fnm auto-selects on `cd` |
| **pnpm** | **standalone** installer (`get.pnpm.io`), pinned to `packageManager` | Version-independent of Node; an fnm patch bump can't lose it |
| **OpenSpec CLI** | `@fission-ai/openspec`, `npm i -g` in the image | The `openspec/` skills (`/opsx:*`) require it. **Not** the bare `openspec` package — that's an empty placeholder |
| **Claude Code** | official Dev Container Feature | `claude` in the container |
| **GitHub CLI** | official Dev Container Feature | `gh` for PRs + HTTPS git auth |
| **JDK** | the `java:1-<N>` base image (or the `java` Feature) | Kotlin/Gradle backends |
| **Gradle** | the checked-in `./gradlew` wrapper | Nothing to install |
| **Playwright** | `playwright install --with-deps chromium` in post-create | E2E; kept in sync with the pinned browser |

The whole JS toolchain (fnm + Node + standalone pnpm + OpenSpec) is built in
`.devcontainer/Dockerfile`; the binaries above come from Features layered on top.

### Base image by stack

| Stack | Base image | Extra |
| --- | --- | --- |
| Frontend only | `devcontainers/base:debian-12` | — |
| Kotlin/Gradle (± frontends) | `devcontainers/java:1-<JDK>-bookworm` | Remove the base image's broken yarn apt source (expired key breaks `apt-get update`) |
| docker-in-docker / Supabase | `devcontainers/base:ubuntu-24.04` | dind Feature + `--privileged` |

## Shared repositories

Nothing large lives in the container's disposable layer. It goes in **named
Docker volumes**, split into two kinds.

### Shared across every dev container (download once per machine)

Four volumes are shared by *every* project's container: **`devcontainer-cache`**
at **`/cache`** (dependencies), **`devcontainer-claude`** at `~/.claude` and
**`devcontainer-gh`** at `~/.config/gh` (CLI logins), and
**`devcontainer-playwright`** at `~/.cache/ms-playwright` (browsers) — each
covered below.

`devcontainer-cache` at `/cache` is shared by *every* project's container. A package or Gradle dependency downloaded by one
project is already present for the next, and it survives rebuilds.

- **pnpm store** → `/cache/pnpm-store`. Set in post-create with
  `pnpm config set --global store-dir /cache/pnpm-store` (pnpm ignores every
  equivalent env var, so `devcontainer.json` can't set it).
- **Gradle cache** → `/cache/gradle`, via `GRADLE_USER_HOME=/cache/gradle` in
  `containerEnv`. Gradle locks the shared home, so multiple projects/daemons
  share it safely — exactly like sharing `~/.gradle` on a host.

!!! warning "The source name is the sharing mechanism"
    `devcontainer-cache` / `/cache` must be **identical** across projects. A
    project-scoped name or a different mount path silently un-shares the cache.
    The same applies to `devcontainer-claude` / `devcontainer-gh` /
    `devcontainer-playwright` below.

### `claude` and `gh` logins — shared, not per project

Log in **once per machine**, and the login survives every rebuild:

| Volume | Mounted at | Also needs, in `containerEnv` |
| --- | --- | --- |
| `devcontainer-claude` | `~/.claude` | `CLAUDE_CONFIG_DIR=/home/vscode/.claude` |
| `devcontainer-gh` | `~/.config/gh` | `GH_CONFIG_DIR=/home/vscode/.config/gh` |

!!! danger "The volume alone is not enough — it persists everything except the credentials"
    Both CLIs put their credentials somewhere the obvious mount misses, which is
    why per-project `<name>-claude` / `<name>-gh` volumes still forced a login on
    every rebuild:

    - **Claude Code** splits its state. The tokens land in
      `~/.claude/.credentials.json` (on the volume), but the **account** lives in
      `~/.claude.json` — a file in `$HOME`, which no volume covers. Setting
      `CLAUDE_CONFIG_DIR` moves it to `~/.claude/.claude.json`, onto the volume.
    - **gh** derives its config dir from `$XDG_CONFIG_HOME/gh`, and the
      **JetBrains backend re-points `XDG_CONFIG_HOME` at `/.jbdevcontainer/config`**
      — the same gotcha that breaks pnpm's `store-dir`. So `gh auth login` wrote
      `hosts.yml` into a throwaway dir and the mounted `~/.config/gh` stayed
      empty. `GH_CONFIG_DIR` is absolute and outranks XDG.

Chown these two mount points **non-recursively** in post-create (they are
shared), and migrate an existing per-project volume with:

```bash
docker run --rm -v <name>-claude:/from -v devcontainer-claude:/to alpine cp -a /from/. /to/
```

Measured effect as projects join the shared pnpm store: `reused 0, downloaded
979` (first project) → `reused 448, downloaded 50` (a later one); a full rebuild
dropped from ~3m to ~1m.

### Playwright browsers — shared, with GC disabled

A full browser set is ~1GB, and it used to be duplicated per project. Share it:

| Volume | Mounted at | Also needs, in `containerEnv` |
| --- | --- | --- |
| `devcontainer-playwright` | `~/.cache/ms-playwright` | `PLAYWRIGHT_BROWSERS_PATH=/home/vscode/.cache/ms-playwright` **and** `PLAYWRIGHT_SKIP_BROWSER_GC=1` |

!!! danger "Sharing without `PLAYWRIGHT_SKIP_BROWSER_GC=1` makes projects delete each other's browsers"
    Playwright tracks who uses each browser with `.links/<sha1>` files holding an
    **absolute path** to that project's `playwright-core`:

    ```
    .links/6a28addc… -> /IdeaProjects/homefleet/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core
    ```

    That path is on the **per-project `node_modules` volume**, invisible from any
    other container. So project B's `playwright install` finds project A's link
    pointing at a missing directory, treats it as *broken*, and garbage-collects
    every browser nothing else references — `_validateInstallationCache` →
    `_deleteStaleBrowsers` + `_deleteBrokenInstallations` in playwright-core's
    registry. It is our `node_modules` isolation colliding with a host-shaped
    cache, not a Playwright bug.

    The env var skips that validation:

    ```js
    if (options?.gc !== false && !getAsBooleanFromENV("PLAYWRIGHT_SKIP_BROWSER_GC"))
      await this._validateInstallationCache(linksDir);
    ```

Two properties make the shared directory safe once GC is off: browsers are
**revision-keyed** (`chromium-1234`), so projects on different Playwright
versions coexist rather than overwrite; and the installer holds a **lockfile**
(20 retries, exponential backoff), so concurrent installs serialise.

!!! warning "The trade-off: nothing reclaims superseded revisions"
    With GC off, `chromium-1233` lingers after every project moves to `-1234`.
    Sweep the volume occasionally — delete the old revision directories, or run
    one `playwright install` with the var unset at a moment when no *foreign*
    `.links` entries are present.

### Per-project (isolated, disposable)

| Volume | Mounted at | Notes |
| --- | --- | --- |
| `<name>-node-modules` | `node_modules` | Keeps host (macOS/Windows) native binaries out of the Linux container |
| `<name>-dind` | `/var/lib/docker` | Only with docker-in-docker; persists the nested Supabase images |

!!! danger "Never mount a volume at `~/.local/share/pnpm` (PNPM_HOME)"
    The standalone pnpm binary is baked into the image there; a volume would
    shadow it. The store lives in `/cache`, never under PNPM_HOME.

## Identity and editors

- **Static name** via `runArgs: ["--name", "<name>-dev", "--hostname", "<name>"]`
  — stable `docker ps` / attach, and a `vscode@<name>` prompt. Only one instance
  at a time; a stale container 409s a rebuild — clear it with `docker rm -f <name>-dev`.
- **Both editors, one container**: `customizations.vscode` for VS Code,
  `customizations.jetbrains` for Gateway. Backend `WebStorm` for frontend
  projects, `IntelliJ` for Kotlin/Gradle.

## Gotchas (each found the hard way)

1. **`@fission-ai/openspec`, not `openspec`** — the bare name is a 0.0.0 empty
   placeholder with no binary.
2. **Don't shadow PNPM_HOME** with a volume (see above).
3. **`pnpm config set --global` from `$HOME`, install with `CI=true`** — run
   elsewhere it litters a `.pnpm-store` in the repo; without `CI=true` the
   no-TTY store-migration prompt is fatal.
4. **Chown `~/.cache` first** — the Playwright mount makes Docker create it
   root-owned, breaking corepack/pnpm/installers if they run before the chown.
5. **java base**: `rm /etc/apt/sources.list.d/yarn.list` — its expired key breaks
   all `apt-get update`, and thus Playwright `--with-deps`.
6. **`SQLite disk I/O error` usually means Docker Desktop's disk is full**, not a
   config bug. `docker system df`; reclaim with `docker builder prune -af` and
   `docker image prune -af` (neither touches named volumes).
7. **Verify in an interactive shell** (`bash -ic`) — a non-login `bash -c`
   doesn't source `.bashrc`, so fnm/pnpm won't be on PATH and everything looks
   "not installed".

## Verification checklist

Build with `devcontainer up --workspace-folder .`, then inside the container:

- [ ] `node` / `pnpm` versions match the pins; `openspec --version` is 1.6.x.
- [ ] `gh`, `claude` resolve; `java -version` (backend); nested `docker run hello-world` (dind).
- [ ] Logins survived the rebuild: `gh auth status` is authenticated and `claude`
      starts without a login prompt (check from a JetBrains terminal too).
- [ ] `pnpm store path` → `/cache/pnpm-store/v...`, recorded in `node_modules/.modules.yaml`; no `.pnpm-store` in the repo.
- [ ] The project's own **lint / build / unit tests** pass; Chromium launches.
- [ ] Then `docker rm -f <name>-dev` so the IDE owns the container on next open.
