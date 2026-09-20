# 0001. The Playbook defers to the engineering constitution

Date: 2026-09-20

Status: Accepted

## Context

Two bodies of engineering guidance had grown in parallel.

The **Playbook** (`project-setup`) is a published MkDocs site, an npm-installable CLI, and a set of AI skills and Claude context templates. It is broad: architecture, code conventions, testing, API design, security, plus process and operations — git workflow, code review, definition of done, onboarding, privacy, disaster recovery.

The **engineering constitution** (`prule/principles`) is a set of short, imperative files in four tiers — principles, patterns, technologies, documentation — vendored into each project with `git subtree` and loaded into agent context on every task. It is deliberately terse, because length is a direct and recurring cost when a file is read on every task.

Eight Playbook documents had come to cover the same ground as constitution files: Clean Architecture, Clean Code, Testing Strategy, API Design, Observability, Security, Performance, and the frontend State Management and Styling pair. Roughly 320 lines of parallel coverage.

Two of those pairs were created knowingly: `technologies/spring-boot-api.md` was derived from the Playbook's `ApiDesign.md` so the two would agree, and `technologies/spring-boot-operations.md` overlaps `Observability.md`.

Separately, two outright contradictions had already been resolved by retiring the Ktor and devcontainer skills — evidence that parallel documents do not merely duplicate, they diverge, and then instruct agents to do conflicting things.

The same rule stated in two places will disagree within a month, and nobody will know which copy is true. That is `principles/dry.md`, applied to ourselves.

## Decision

**The constitution is the single source of truth for how code is built. The Playbook publishes it and owns everything else.**

1. The constitution is vendored into the Playbook at `docs/constitution/` via `git subtree` and published as a section of the MkDocs site. One published home, one source.
2. The eight duplicated Playbook documents are deleted. Their navigation entries point at the corresponding constitution pages.
3. The Playbook keeps what the constitution should not carry:
   - **Process and organisation** — git workflow, squash and merge, code review, definition of done, onboarding, feature flag process, third-party integration decisions.
   - **Compliance and operations** — privacy, disaster recovery, incident response.
   - **Distribution** — the CLI, the AI skills, the Claude context templates.
4. The repositories stay separate. They have different jobs: the constitution versions with each project's code and is read by agents every task; the Playbook is a site and a distribution mechanism, and does not belong inside every repository.

Rejected alternatives:

- **Merge into one repository.** Forces one artefact to do the other's job badly: either the constitution carries process documentation into every project, inflating what agents load every task, or the Playbook is vendored wholesale including its CLI and skills.
- **Split by audience** — Playbook as human narrative, constitution as agent rules. Sounds clean, but the same rule still lives in two files. Audience is not a reason for two sources; it is a reason for two *presentations* of one source, which is what publishing the constitution achieves.
- **Leave both and cross-link.** Already tried implicitly. It produced the Ktor and devcontainer contradictions.

## Consequences

**Easier.** A rule changes in one place. Agents and people read the same text. The published site gains the constitution's content. Drift between the two bodies stops being possible for the topics that moved.

**Harder.** The Playbook site loses eight pages of narrative prose in favour of terser, more imperative text — the constitution is written for agents first, and reads more like a checklist than a guide. Anyone who valued the longer explanations loses them.

**Accepted risks.**
- Updating the constitution now requires a `git subtree pull` in the Playbook before the site reflects it. A stale site is a new failure mode that did not exist before.
- Constitution files are written to be loaded into context, not browsed. Some will read poorly as web pages, and the house style caps files at 15–25 lines, which limits how much narrative can be added back.
- Updating a constitution rule now requires a `git subtree pull` here before the published site reflects it.

Two consequences recorded as open when this ADR was accepted have since been closed:

- Accessibility, frontend resilience and localisation have been migrated into `technologies/` and their Playbook documents retired, so agents in vendored projects now see them.
- `templates/claude/*.md` have been reduced to pointers at the constitution plus the per-project detail a `CLAUDE.md` should actually carry.
