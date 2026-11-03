---
name: vssw-setup-git-hooks
description: >
  Sets up automatic code formatting on commit: Husky + lint-staged in a repo
  that already has a package.json, or a native Git hook (core.hooksPath) in a
  JVM-only repo, plus the CI check that enforces it. Use this skill whenever
  asked to add pre-commit hooks, formatting on commit, or linting hooks.
---

# Setup Git Hooks Skill

Full standards: `docs/constitution/technologies/formatting.md`.

## 1. Pick the runner

| The repo has | Runner |
|---|---|
| a `package.json` (Node, TypeScript, or a monorepo with a frontend) | **Husky + lint-staged** (§2) |
| no Node (JVM only) | **native `core.hooksPath`** (§3) |

Never add a `package.json` to a JVM-only repo just to run Husky: it makes Node and `pnpm install` a requirement for a hook Git can run on its own.

## 2. Husky + lint-staged

```sh
pnpm add -D husky lint-staged
pnpm exec husky init        # creates .husky/pre-commit and the "prepare": "husky" script
echo "pnpm exec lint-staged" > .husky/pre-commit
```

```json
"lint-staged": { "*": "prettier --write --ignore-unknown" }
```

lint-staged formats only the staged files, re-stages them, and restores anything the developer left unstaged. `pnpm install` runs `prepare`, so every clone gets the hook with no extra step.

In a monorepo with a JVM backend, use `lint-staged.config.mjs` and give Gradle a **function**, or lint-staged appends the file names and Gradle reads them as task names:

```js
export default {
  '*': 'prettier --write --ignore-unknown',
  '*.{kt,kts,java}': () => './gradlew spotlessApply',
};
```

Pin `husky` and `lint-staged` exactly, like every other dependency.

## 3. Native hook (JVM-only repos)

Create `.githooks/pre-commit` and make it executable (`chmod +x .githooks/pre-commit`):

```sh
#!/bin/sh
# .githooks/pre-commit — format staged code before committing
set -e
staged=$(git diff --cached --name-only --diff-filter=ACMR)
[ -z "$staged" ] && exit 0
./gradlew spotlessApply --quiet
echo "$staged" | xargs git add --
```

Spotless has no cheap per-file mode, so it formats the project; the hook then **re-stages only the files that were already staged**. **Never `git add .` in a hook** — it sweeps unrelated working-tree changes into the commit.

Register the hook path so every clone gets it. `core.hooksPath` is local git config and is **not** carried by a clone, so do it from the build:

```kotlin
tasks.register<Exec>("installGitHooks") { commandLine("git", "config", "core.hooksPath", ".githooks") }
tasks.named("build") { dependsOn("installGitHooks") }
```

Or add `git config core.hooksPath .githooks` to `./run setup`. With neither, document it as a once-per-clone step in `CLAUDE.md` and the README.

## 4. Add the CI check (required)

**The hook is convenience; CI is enforcement.** `git commit --no-verify` skips any hook, Husky's included. Always add a CI step that fails on a diff:

- JVM: `./gradlew spotlessCheck`
- TypeScript: `pnpm prettier --check .`

Do not consider the setup complete without this step.

## 5. Formatters

| Language | Formatter | Command |
|---|---|---|
| Kotlin | ktfmt (kotlinlang style) | `./gradlew spotlessApply` |
| Java | google-java-format | `./gradlew spotlessApply` |
| TypeScript, JS, JSON, CSS, MD | Prettier | `pnpm format` |

Spotless drives both JVM formatters from one plugin:

```kotlin
spotless {
  kotlin { ktfmt(libs.versions.ktfmt.get()).kotlinlangStyle() }
  kotlinGradle { ktfmt(libs.versions.ktfmt.get()).kotlinlangStyle() }
  java { googleJavaFormat(libs.versions.googleJavaFormat.get()) }
}
```

Pin formatter versions in the version catalog — an unpinned formatter reformats the world when it upgrades. For a Kotlin-only project, `ktfmt-gradle` is lighter and provides `ktfmtFormat` directly.

## 6. Supporting files
- Commit an `.editorconfig` so editors agree before a formatter runs.
- Keep lint to correctness rules so it never fights the formatter: oxlint's `correctness` category has no style rules (an ESLint setup needs `eslint-config-prettier`).
- Do the initial mass reformat as its own commit, and add its SHA to `.git-blame-ignore-revs` so `git blame` stays useful.
- Exclude generated code and vendored files (`docs/constitution/`) from formatting.

## Smells
A `package.json` in a JVM-only repo that exists only for Husky, `git add .` in a hook, a lint-staged entry passing file names to Gradle, an unpinned `husky`, a hook with no CI check behind it.
