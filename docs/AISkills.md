# AI Skills Hub

This repository isn't just a playbook of rules for human engineers to follow. It is an **Installable AI Plugin**.

By installing these skills into your local AI environment, your AI coding assistant will automatically learn our company's specific rules for generating migrations, scaffolding APIs, and implementing feature flags. 

## Included Skills

1. **`vssw-generate-db-migration`**: Generates zero-downtime migrations in the project's own tool (Supabase CLI with Row Level Security, or Flyway for Spring), using Expand and Contract.
2. **`vssw-scaffold-idempotent-api`**: Forces the AI to generate REST endpoints that validate `Idempotency-Key` headers, format errors using RFC 9457 Problem Details, and return HATEOAS links.
3. **`vssw-scaffold-hateoas-feature-flag`**: For a Spring Boot REST backend, instructs the AI to build backend feature flag checks that inject HATEOAS links, and frontend components that render conditionally based on those links.
4. **`vssw-run-script`**: In a repo with a `./run` script, instructs the AI to use it for setting up, serving, or building the project rather than the tools it wraps.
5. **`vssw-integrate-google-form`**: Intercepts requests for feedback, support, survey, waitlist or email-capture forms and implements a native form posting to a Google Form instead of a custom database, sending only the data the form needs.
6. **`vssw-setup-git-hooks`**: Generates native Git hooks (using `.githooks` and `core.hooksPath`) for automatic formatting/linting on commit.
7. **`vssw-audit-project-compliance`**: Audits the project against the engineering constitution and Playbook standards, distinguishing recorded deviations from unrecorded ones and ordering failures by consequence.
8. **`vssw-scaffold-playwright-screenplay-test`**: Scaffolds an end-to-end test using Playwright with the Serenity/JS Screenplay pattern, as required by our [Testing Strategy](constitution/patterns/testing-strategy.md).

9. **`vssw-bootstrap-project`**: Takes an empty folder to a project ready for spec-driven work — git, OpenSpec, the engineering constitution vendored as a subtree, a wired `openspec/config.yaml` and a `CLAUDE.md`.

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

