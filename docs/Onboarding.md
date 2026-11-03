# Developer Onboarding (Day One)

Welcome to the team! This guide will get your local environment running quickly.

## 1. Prerequisites
Before pulling the code, ensure you have the following installed:
- **Node.js 24+** (Use `nvm` or `fnm` to manage versions).
- **Node and pnpm:** the versions in the project's `.node-version` and `package.json` `packageManager`. Install pnpm standalone (`curl -fsSL https://get.pnpm.io/install.sh | sh -`), never with npm.
- **Docker** (Docker Engine, OrbStack, or the team's dev VM) for the local PostgreSQL database and the Supabase stack.
- **Java 21+** (if working on the backend). Use SDKMAN to manage versions.

## 2. Secrets & Environment Variables
We do not commit secrets to Git.
1. Copy the template file: `cp .env.example .env`
2. Ask your team lead or check our secure vault (e.g., 1Password / AWS Secrets Manager) for the required local development keys.

## 3. Project Commands
The project's `CLAUDE.md` lists the commands to set up, run, test and build it. Some projects wrap them in a `./run` script at the root; if yours has one, use it, for example:
- `./run db:up` - Starts the local Docker containers (PostgreSQL, etc.).
- `./run backend:start` - Boots the backend server.
- `./run frontend:start` - Installs `pnpm` dependencies and starts the Vite dev server.

If you forget a command, run `./run help` where the script exists, or read `CLAUDE.md`.
