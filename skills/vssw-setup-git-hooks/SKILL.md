---
name: vssw-setup-git-hooks
description: >
  Sets up automatic code formatting on commit using Git Hooks.
  Use this skill whenever asked to add pre-commit hooks, formatting on commit, or linting hooks.
---

# Setup Git Hooks Skill

When asked to set up git hooks for formatting or linting, enforce the following pattern using Git's native `core.hooksPath` feature (do not use third-party tools like Husky — it adds a Node dependency for a problem Git already solves).

## 1. Create the Hooks Directory
- Create a `.githooks` directory in the root of the project.
- Create a `.githooks/pre-commit` file.
- The file must be executable (e.g., recommend running `chmod +x .githooks/pre-commit`).

## 2. Define the Pre-Commit Hook

The hook formats the project, then **re-stages only the files that were already staged**:

```sh
#!/bin/sh
# .githooks/pre-commit — format staged code before committing
set -e
staged=$(git diff --cached --name-only --diff-filter=ACMR)
[ -z "$staged" ] && exit 0
echo "$staged" | xargs pnpm exec prettier --write --ignore-unknown --log-level warn --
echo "$staged" | xargs git add --
```

Format **only the staged files** where the formatter supports it — fast, quiet, and `.prettierignore` still applies. For a JVM project call `./gradlew spotlessApply` (Spotless has no cheap per-file mode), or `./run format` where a run script wraps it.

**Never use `git add .` in a pre-commit hook.** It sweeps unrelated working-tree changes into the commit — changes the developer deliberately left unstaged for a separate commit. Re-stage only what was already staged, as above.

If `pnpm` may not be on PATH (GUI git clients, minimal shells), guard the call and let CI catch it rather than blocking the commit:

```sh
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pre-commit: pnpm not on PATH — skipping. CI will check it." >&2
  exit 0
fi
```

## 3. Register the Hooks Path
- To ensure all developers use the hook, the hook path must be registered locally.
- Instruct the user to add the following command to the project's `./run setup` script (or equivalent bootstrap script):
  `git config core.hooksPath .githooks`
- This guarantees that anyone who sets up the project automatically has the pre-commit hook enabled.
- `core.hooksPath` is **local git config and is not carried by a clone**. Without a setup script, document it as a once-per-clone step in the project's `CLAUDE.md` and README.

## 4. Add the CI Check (required)

**The hook is convenience; CI is enforcement.** `git commit --no-verify` bypasses the hook entirely, so a formatting rule policed only by a hook is not policed. Always add a CI step that checks formatting and fails on a diff:

- JVM: `./gradlew spotlessCheck`
- TypeScript: `pnpm prettier --check .`

Do not consider the setup complete without this step.

## 5. Formatters

| Language | Formatter | Command |
|---|---|---|
| Kotlin | ktfmt (kotlinlang style) | `./gradlew spotlessApply` |
| Java | google-java-format | `./gradlew spotlessApply` |
| TypeScript, JS, JSON, CSS, MD | Prettier | `pnpm format` |

Spotless drives both JVM formatters from one plugin, so a single task covers mixed Java/Kotlin projects:

```kotlin
spotless {
  kotlin { ktfmt(libs.versions.ktfmt.get()).kotlinlangStyle() }
  kotlinGradle { ktfmt(libs.versions.ktfmt.get()).kotlinlangStyle() }
  java { googleJavaFormat(libs.versions.googleJavaFormat.get()) }
}
```

Pin formatter versions in the version catalog — an unpinned formatter reformats the world when it upgrades. For a Kotlin-only project, `ktfmt-gradle` is lighter and provides `ktfmtFormat` directly.

## 6. Supporting Files
- Commit an `.editorconfig` so editors agree before a formatter runs.
- Use `eslint-config-prettier` so lint rules never fight the formatter.
- Do the initial mass reformat as its own commit, and add its SHA to `.git-blame-ignore-revs` so `git blame` stays useful.
- Exclude generated code and vendored files from formatting.

Full standards: `technologies/formatting.md` in the engineering constitution.
