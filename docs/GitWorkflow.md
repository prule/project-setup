# Git Workflow & Collaboration

A consistent Git workflow ensures our team can collaborate effectively, trace changes easily, and automate deployments predictably.

## 1. Branching Strategy: GitHub Flow / Lightweight Trunk-Based
We prefer a lightweight branching model. Long-lived feature branches are discouraged.
- **`main`:** The single source of truth. It is always deployable.
- **Feature Branches:** Branched off `main` (e.g., `feature/login-page`, `fix/header-alignment`).
- **Merge Strategy:** [Squash and merge](./SquashAndMerge.md) into `main`. This keeps the `main` history clean and linear.

## 2. Commit Conventions
We follow the **Conventional Commits** standard. This makes the history readable and allows for automated changelog generation and semantic versioning.

**Format:** `<type>(<optional scope>): <description>`

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

*Example:* `feat(auth): add JWT session refresh logic`

## 3. Pull Requests & Code Reviews
- **Keep PRs Small:** Aim for PRs that can be reviewed in under 15 minutes (typically under 400 lines of change).
- **Descriptive Titles & Descriptions:** The PR title should be a conventional commit. The description should explain *why* the change is made, not just *what* changed.
- **Review Culture:** 
  - Be kind and constructive.
  - Ask questions instead of making demands (e.g., "What do you think about extracting this function?" instead of "Extract this function.").
  - Approve when the code is better than it was, even if it's not perfect. Perfect is the enemy of good.
- **CI Checks:** All PRs must pass automated formatting, linting, and tests before they can be merged.

## 4. Keeping `main` Deployable (Breaking Down Work)

Because `main` must *always* be in a deployable state, a large feature should rarely be built in a single, massive PR. Instead, break the work down into multiple, small PRs that can be merged independently without breaking the app or disrupting the user experience. This reduces risk and makes code review much faster.

### Example: Building a New "User Profile" Feature

Instead of one giant PR containing the database changes, backend API routes, and frontend UI, break it down logically:

1. **PR 1: Database Migrations & Models (Hidden)**
   - Add the `user_profiles` table (via Flyway) and the corresponding backend Entity/Repository.
   - *Result:* Safely merged. The app works as before; the new table is simply sitting empty.
2. **PR 2: The Backend API (Hidden)**
   - Add the REST controllers and services (`GET /api/users/{id}/profile`, etc.).
   - Add unit and integration tests.
   - *Result:* Safely merged. The API exists and is tested, but the frontend doesn't call it yet.
3. **PR 3: Frontend UI Components (Hidden / Dark Launched)**
   - Build the React components and the new route (e.g., `/profile`).
   - Do *not* add the navigation link to the main menu yet (or hide the route behind a feature flag).
   - *Result:* Safely merged. Developers can manually navigate to the URL to test it, but regular users won't stumble upon it.
4. **PR 4: The Reveal (Live)**
   - Add the "My Profile" button to the main navigation menu.
   - *Result:* Safely merged. The feature is now officially live and accessible to all users.

By slicing the work incrementally like this, we avoid "merge hell," drastically reduce the blast radius of bugs, and ensure our `main` branch is continuously deliverable.
