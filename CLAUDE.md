# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the **VSSW Engineering Playbook** — a documentation site *and* an installable AI plugin. It contains no application source code. Its three products are:

1. **`docs/`** — the playbook prose, published to https://prule.github.io/project-setup/ via MkDocs Material.
2. **`skills/`** — agent skills (`SKILL.md` files) that encode the playbook's rules as executable instructions, installed into other repos.
3. **`templates/claude/`** — starter context files (`backend.md`, `frontend.md`, `monorepo.md`) that users drop into new projects.

The critical property: **the docs, the skills, and the templates must agree.** A rule stated in `docs/` should be enforceable by a skill, and both should match what the templates tell an AI to do. When changing a standard, update all the places it appears.

## Commands

Always use the `./run` script rather than invoking `pip`/`mkdocs` directly (this is itself a playbook rule — see `skills/vssw-run-script/`):

```bash
./run setup    # pip install mkdocs-material
./run serve    # live-reload server at http://127.0.0.1:8000
./run build    # static site into site/
```

There is no test suite; `npm test` is an unimplemented stub. Verification is: does `./run serve` render, and does the nav resolve.

The installer is exercised with:

```bash
npx github:prule/project-setup init   # copies skills/ -> <cwd>/.agents/skills
```

## Publishing pipeline

`.github/workflows/docs-deploy.yml` runs `mkdocs gh-deploy --force` on every push to `main`. **A new file in `docs/` is invisible until it is added to the `nav:` block in `mkdocs.yml`** — MkDocs will build without it and silently drop it from the site. Cross-links between docs use relative `.md` paths (`./SquashAndMerge.md`), which MkDocs rewrites at build time.

CI installs **only `mkdocs-material`**, so the site must render with the stock extension set declared in `mkdocs.yml`. Don't reach for a Markdown extension that needs another `pip install` — it will work locally and break the deploy.

### Nested lists need 4 spaces, not 2

MkDocs uses Python-Markdown, which — unlike CommonMark and GitHub — requires **4 spaces per nesting level** in lists. A 2-space indent that looks correctly nested in an editor or on GitHub renders as a **flat sibling list** on the site. Nest at 4 / 8 / 12 spaces; under an ordered list (`1. `) it is still 4, not 3.

Check the rendered HTML rather than the source when a list looks wrong — the giveaway is a `<ul>` with no `<ul>` inside any `<li>`.

## Adding or editing a skill

Skills live in `skills/vssw-<kebab-name>/SKILL.md`. Two naming conventions coexist and both matter:

- **Directory**: `vssw-scaffold-ktor-controller` (hyphenated)
- **Frontmatter `name:`**: `vssw:scaffold-ktor-controller` (colon-separated) — this is how the skill is invoked and referenced in `templates/claude/*.md`

Frontmatter is `name` + `description` only. The `description` is a trigger phrase — write it as "Use this skill whenever the user asks to …", because it is the only thing an agent sees when deciding whether to load the skill. The body is imperative instructions to the AI, not documentation for humans.

Skills may ship a sibling `templates/` directory of literal files to copy out (see `skills/vssw-scaffold-devcontainer/templates/`); `bin/cli.js` copies the whole `skills/` tree recursively, so those come along automatically.

A new skill must also be added to the numbered list in `docs/AISkills.md`, and to the relevant `templates/claude/*.md` "Available AI Skills" section if it applies to that stack.

## Standards this repo advocates (and follows)

These come from `docs/GitWorkflow.md`, `docs/SquashAndMerge.md`, and the templates:

- **Conventional Commits**: `<type>(<scope>): <description>`. PR titles are conventional commits too.
- **Squash-merge into `main`, always.** The stated reason is version derivation: version is computed from git history at build time, so one PR must equal exactly one commit on `main` for the version to bump exactly once.
- **Small PRs** (~under 400 lines), branched off `main`, `main` always deployable.

## Repo-specific gotchas

- The README file is `ReadMe.md` (mixed case), not `README.md`. Its content largely duplicates `docs/AISkills.md` — keep the installation instructions in the two in sync.
- `The Engineering Playbook.pdf` is a stale generated artifact, not a source of truth; `docs/` is authoritative.
- `.idea/` and `ProjectSetup.iml` are committed IntelliJ config. Leave them alone.
