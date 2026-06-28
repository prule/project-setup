# Code Review Guidelines

Code reviews are about ensuring architectural integrity, security, and knowledge sharing - not nitpicking.

## 1. The Philosophy
- **Automate the Pedantry:** Formatting, linting, and imports are handled by Husky, Prettier, and ESLint/ktfmt. Do not leave comments about formatting.
- **Assume Competence & Good Intent:** Always phrase feedback as a question or suggestion, not a command (e.g., "What do you think about extracting this function?" instead of "Extract this function.").
- **Review Architecture & Logic:** Look for race conditions, security flaws, missing test coverage, and violations of Clean Architecture.

## 2. Conventional Comments
To make feedback clear and actionable, prefix your comments with one of the following labels:
- **`blocking:`** The PR cannot be merged until this is addressed (e.g., a security flaw or major bug).
- **`suggestion:`** A proposed improvement. The author can choose to implement it or explain why they won't, but it does not block the merge.
- **`nit:`** Minor, non-blocking feedback (e.g., a slightly better variable name). Feel free to ignore.
- **`question:`** Seeking clarification to understand the code better.

## 3. PR Size & SLAs (Service Level Agreements)
- **Keep it Small:** PRs should ideally be under 400 lines of code. Large PRs get rubber-stamped; small PRs get rigorous reviews.
- **Turnaround Time:** Reviews should happen within 24 hours. A PR sitting for days is blocked inventory and slows down the entire team.
