# Developer Onboarding (Day One)

Welcome to the team! This guide will get your local environment running quickly.

## 1. Prerequisites
Before pulling the code, ensure you have the following installed:
- **Node.js 24+** (Use `nvm` or `fnm` to manage versions).
- **pnpm:** `npm install -g pnpm`.
- **Docker Desktop** (or OrbStack on Mac) for running the local PostgreSQL database and Redis cache.
- **Java 21+** (if working on the backend). Use SDKMAN to manage versions.

## 2. Secrets & Environment Variables
We do not commit secrets to Git.
1. Copy the template file: `cp .env.example .env`
2. Ask your team lead or check our secure vault (e.g., 1Password / AWS Secrets Manager) for the required local development keys.

## 3. The `./run` Script
We automate common tasks via a `./run` script located in the root of the project.
- `./run db:up` - Starts the local Docker containers (PostgreSQL, etc.).
- `./run backend:start` - Boots the backend server.
- `./run frontend:start` - Installs `pnpm` dependencies and starts the Vite dev server.

If you ever get stuck or forget a command, simply execute `./run help`.
