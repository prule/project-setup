# AI Skills Hub

This repository isn't just a playbook of rules for human engineers to follow. It is an **Installable AI Plugin**.

By installing these skills into your local AI environment, your AI coding assistant will automatically learn our company's specific rules for generating migrations, scaffolding APIs, and implementing feature flags. 

## Included Skills

1. **`vssw-generate-db-migration`**: Forces the AI to generate zero-downtime Flyway scripts using the Expand and Contract pattern.
2. **`vssw-scaffold-idempotent-api`**: Forces the AI to generate REST endpoints that validate `Idempotency-Key` headers, format errors using RFC 7807, and return HATEOAS links.
3. **`vssw-scaffold-hateoas-feature-flag`**: Instructs the AI to build backend feature flag checks that inject HATEOAS links, and frontend components that render conditionally based on those links.
4. **`vssw-run-script`**: Instructs the AI to always use the `./run` script for setting up, serving, or building the project, abstracting away underlying package managers.
5. **`vssw-scaffold-ktor-repository`**: Generates a Hexagonal Architecture repository mapping Domain Models to JetBrains Exposed Entities.
6. **`vssw-scaffold-ktor-search-criteria`**: Implements a standard Search Criteria pattern with dynamic `.toQuery()` Exposed DSL mapping.
7. **`vssw-scaffold-ktor-controller`**: Generates a REST Controller using Ktor Type-Safe Routing and inline OpenAPI documentation.
8. **`vssw-integrate-google-form-feedback`**: Intercepts requests to build feedback features and implements a lightweight, headless Google Form submission instead of a custom database.
9. **`vssw-integrate-google-form-register-interest`**: Implements a "waitlist" or email capture mechanism using a headless Google Form submission.
10. **`vssw-setup-git-hooks`**: Generates native Git hooks (using `.githooks` and `core.hooksPath`) for automatic formatting/linting on commit.
11. **`vssw-audit-project-compliance`**: Scans the current project to ensure it meets the playbook's strict standards (e.g., checks for `./run`, `pnpm`, PWA setup, Serenity/Screenplay E2E tests, and Hexagonal Architecture).
12. **`vssw-scaffold-devcontainer`**: Scaffolds (or aligns) a project's [Dev Container](DevContainers.md) to the standard — Node via fnm, standalone pnpm, the OpenSpec CLI, Claude Code + GitHub CLI, Java/Gradle, and the shared pnpm/Gradle caches. Ships templates for the frontend, Kotlin/Gradle, and docker-in-docker variants.
13. **`vssw-scaffold-playwright-screenplay-test`**: Scaffolds an end-to-end test using Playwright with the Serenity / Screenplay pattern, as required by our [Testing Strategy](TestingGuide.md).

## Installation

### 🚀 1-Click Installation (Claude Code)
To install these AI skills locally into any project, simply navigate to your project directory and run:

```bash
npx github:prule/project-setup init
```

This will instantly copy the Playbook's AI instructions into your project's `.claude/skills` folder — the location Claude Code scans for project skills. Because these are now local files, your AI assistant will immediately adhere to our standards, and the rules will be committed to version control for the rest of your team to use!

Restart Claude Code after installing (or run `/skills`) so it picks up the new skills.

#### Other AI assistants
The installer also writes an **`AGENTS.md`** pointing at `.claude/skills/` (appending to yours if you already have one, rather than overwriting it). `AGENTS.md` is the cross-tool convention most coding agents read, so assistants other than Claude Code are directed to the same single copy of the skills. The skills are deliberately **not** duplicated into a second directory — one location stays authoritative and cannot drift.

### Installing in Claude (Claude Projects)
To use these playbook skills with Anthropic's web-based Claude:
1. Create a new **Project** in the Claude web interface.
2. Under **Project Knowledge**, upload the `SKILL.md` files from the `skills/` directory of this repository.
3. In the **Custom Instructions** for the project, add the following directive:
   > "When asked to perform a task matching one of the skills in the Project Knowledge, please read the corresponding SKILL.md file and follow its instructions exactly before writing any code."
4. You can now chat in your project, and Claude will reference our company's playbook rules when prompted!

