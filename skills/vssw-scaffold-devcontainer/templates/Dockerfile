# syntax=docker/dockerfile:1
# Dev container image for {{PROJECT_NAME}}.
#
# The VSSW dev container standard: Node via fnm (NOT corepack), pnpm installed
# standalone, and the OpenSpec CLI baked in. See docs/DevContainers.md.
#
# Node/pnpm versions below are the authoritative repo pins. Node is driven by
# {{NODE_VERSION_FILE}} (fnm reads .node-version / .nvmrc); if you bump it or the
# `packageManager` pin, update the matching ARG here and rebuild.

# CHOOSE THE BASE for the stack (see docs/DevContainers.md "Base image"):
#   Frontend only ............ mcr.microsoft.com/devcontainers/base:debian-12
#   Kotlin/Gradle backend .... mcr.microsoft.com/devcontainers/java:1-21-bookworm
#   docker-in-docker / other . mcr.microsoft.com/devcontainers/base:ubuntu-24.04
FROM {{BASE_IMAGE}}

# --- Pinned versions (keep in sync with the repo's version files) ------------
ARG NODE_VERSION={{NODE_VERSION}}
ARG PNPM_VERSION={{PNPM_VERSION}}
# OpenSpec CLI — the committed .claude/skills/openspec-* skills require it. Use
# the SCOPED package; the bare `openspec` on npm is an empty placeholder.
ARG OPENSPEC_VERSION=1.6.0

# The base image ships a non-root `vscode` user with passwordless sudo; build the
# JS toolchain under that user so file ownership matches at runtime.
USER vscode
ENV FNM_DIR=/home/vscode/.fnm
ENV PNPM_HOME=/home/vscode/.local/share/pnpm

# --- (java base only) fix the broken yarn apt source -------------------------
# The devcontainers/java image ships a yarn apt source whose signing key is
# expired, breaking EVERY `apt-get update` (and therefore Playwright's
# `install --with-deps`). Uncomment on the java base; we use pnpm, not yarn.
# RUN sudo rm -f /etc/apt/sources.list.d/yarn.list

# --- fnm + Node --------------------------------------------------------------
RUN curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir "$FNM_DIR" --skip-shell \
    && "$FNM_DIR/fnm" install "$NODE_VERSION" \
    && "$FNM_DIR/fnm" default "$NODE_VERSION"

# --- pnpm (standalone) -------------------------------------------------------
# Self-contained pnpm, NOT tied to a Node install (an fnm patch bump won't lose
# it). Pinned to package.json's `packageManager`. NOTE: never mount a volume at
# ${PNPM_HOME} — it would shadow this baked-in binary.
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION="$PNPM_VERSION" SHELL=/bin/bash sh -

# --- Shell wiring ------------------------------------------------------------
# fnm + pnpm on PATH for every interactive shell; fnm auto-selects the Node
# version on `cd`. Written to ~/.bashrc AND ~/.zshrc.
RUN <<'EOF'
set -e
for shell in bash zsh; do
  rc="/home/vscode/.${shell}rc"
  touch "$rc"
  {
    echo ''
    echo '# --- {{PROJECT_NAME}} dev container: fnm + pnpm ---'
    echo 'export FNM_DIR="$HOME/.fnm"'
    echo 'export PNPM_HOME="$HOME/.local/share/pnpm"'
    echo 'export PATH="$FNM_DIR:$PNPM_HOME/bin:$PATH"'
    echo "eval \"\$(fnm env --use-on-cd --shell ${shell})\""
  } >> "$rc"
done
EOF

# Make the tools available to non-interactive RUN/postCreate steps too.
ENV PATH="${FNM_DIR}:${PNPM_HOME}/bin:/home/vscode/.fnm/aliases/default/bin:${PATH}"

# --- OpenSpec CLI ------------------------------------------------------------
# npm (not pnpm): drops the `openspec` binary into the fnm Node's bin, already
# on PATH. A container dev tool, not an app dependency.
RUN npm install -g @fission-ai/openspec@${OPENSPEC_VERSION}
