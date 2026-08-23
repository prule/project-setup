#!/usr/bin/env bash
# One-time provisioning for the {{PROJECT_NAME}} dev container (postCreateCommand).
# Idempotent — safe to re-run:  bash .devcontainer/post-create.sh
# See docs/DevContainers.md for the rationale behind each step.
set -euo pipefail

echo "==> {{PROJECT_NAME}} dev container: provisioning"

# 1. Volume ownership. Named volumes are created root-owned. This MUST come
#    first: mounting a volume at ~/.cache/ms-playwright makes Docker create the
#    ~/.cache parent root-owned, breaking corepack/pnpm/installers otherwise.
#    Chown the SHARED volumes NON-recursively (/cache/pnpm-store, /cache/gradle
#    if used, ~/.cache/ms-playwright, ~/.claude, ~/.config/gh) — they are shared
#    with every other dev container on this machine, so recursing wastes time and
#    can fight another container.
#    (Do NOT chown /var/lib/docker — the dind feature owns it.)
echo "==> Fixing volume ownership"
sudo mkdir -p node_modules ~/.cache/ms-playwright ~/.claude ~/.config/gh /cache/pnpm-store
sudo chown -R vscode:vscode node_modules
sudo chown vscode:vscode /cache/pnpm-store ~/.cache ~/.cache/ms-playwright ~/.claude ~/.config ~/.config/gh
# Kotlin/Gradle only: sudo mkdir -p /cache/gradle && sudo chown vscode:vscode /cache/gradle

# 1b. Migrate a pre-CLAUDE_CONFIG_DIR login. Claude Code used to keep the
#     account in ~/.claude.json ($HOME, unmounted) while the tokens sat in
#     ~/.claude/.credentials.json (the volume) — so a rebuild dropped the
#     account and forced a re-login. CLAUDE_CONFIG_DIR (devcontainer.json)
#     now puts both on the shared volume; carry any stray $HOME copy over once.
if [ -f ~/.claude.json ] && [ ! -f ~/.claude/.claude.json ]; then
  echo "==> Migrating ~/.claude.json onto the shared claude volume"
  mv ~/.claude.json ~/.claude/.claude.json
fi

# 2. Toolchain. Sync Node to the repo pin (fnm reads .node-version / .nvmrc).
export FNM_DIR="$HOME/.fnm"
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$FNM_DIR:$PNPM_HOME/bin:$PATH"
eval "$(fnm env)"
fnm use --install-if-missing
fnm default "$(fnm current)"
echo "==> Toolchain: node $(node --version), pnpm $(pnpm --version)"

# 3. Git hooks (only if the repo uses .githooks; remove otherwise).
# git config core.hooksPath .githooks

# 4. Point pnpm at the shared store. ONLY pnpm's global config works: it ignores
#    npm_config_store_dir / PNPM_STORE_DIR / .npmrc for store-dir. Run from
#    $HOME so pnpm doesn't leave a stray .pnpm-store in the repo. Covers every
#    pnpm project in the repo (store-dir is global).
echo "==> Pointing pnpm at the shared store (/cache/pnpm-store)"
( cd "$HOME" && pnpm config set --global store-dir /cache/pnpm-store )

# 5. Install deps. CI=true so pnpm purges/rebuilds node_modules without a TTY
#    prompt when the store moved. Repeat per pnpm project (root, frontend/, ...).
echo "==> Installing dependencies"
CI=true pnpm install --frozen-lockfile
# ( cd frontend && CI=true pnpm install --frozen-lockfile )   # if app is in a subdir

# 6. Kotlin/Gradle only: warm the build (resolves backend deps into /cache/gradle).
# ./gradlew classes testClasses --parallel

# 7. Playwright browser + OS deps (best effort — a browser download failing
#    shouldn't fail the whole provision).
echo "==> Installing Playwright Chromium"
pnpm exec playwright install --with-deps chromium || \
  pnpm exec playwright install chromium || \
  echo "  ! Playwright browser install skipped — run 'pnpm exec playwright install --with-deps chromium' later."

echo "==> Done."
