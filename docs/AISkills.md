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

## Installation

To install these skills locally, follow these steps:

1. **Clone this repository** to your local machine (e.g., `~/code/ProjectSetup`).
2. **Locate your Global Customizations Root**. For this AI system, it is usually located at `~/.gemini/config/`.
3. **Edit or create `skills.json`** in that config directory.
4. Add the absolute path to the `skills/` directory of this repository:

```json
{
  "entries": [
    { "path": "/path/to/your/clone/ProjectSetup/skills" }
  ]
}
```

Once this file is saved, your AI agent will instantly discover and load these skills, making it perfectly aligned with our engineering standards!
