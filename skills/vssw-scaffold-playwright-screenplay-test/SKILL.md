---
name: vssw-scaffold-playwright-screenplay-test
description: >
  Scaffolds a new end-to-end (E2E) test using Playwright and the Serenity / Screenplay pattern.
  Use this skill whenever asked to write an E2E test, UI test, or Playwright test for a frontend application.
---

# Scaffold Playwright Screenplay Test Skill

When asked to write E2E tests for a frontend application, you must strictly follow the **Serenity / Screenplay** pattern using Playwright. 

## 1. Why the Screenplay Pattern?
- **Why:** The Screenplay pattern decouples the *intent* of the test (e.g., "The user logs in") from the *implementation* of the UI interactions (e.g., "Fill the username field, click the login button"). This makes tests incredibly maintainable and resilient to UI changes. 

## 2. Directory Structure
Ensure the E2E testing directory (e.g., `tests/e2e/`) is organized into the core Screenplay components:
- `tasks/`: High-level business actions (e.g., `Login.ts`, `NavigateTo.ts`).
- `questions/`: Queries about the state of the system (e.g., `Visibility.ts`, `Text.ts`).
- `abilities/`: Interfaces to the system (e.g., `BrowseTheWeb.ts` wrapping the Playwright page object).
- `specs/`: The actual test files describing the scenarios.

## 3. Scaffolding a Test
When writing a test file (e.g., `specs/login.spec.ts`), enforce this structure:

```typescript
import { test, expect } from '@playwright/test';
import { Actor } from '@testla/screenplay';
import { BrowseTheWeb } from '../abilities/BrowseTheWeb';
import { NavigateTo } from '../tasks/NavigateTo';
import { Login } from '../tasks/Login';

test.describe('Authentication', () => {
  test('User can log in successfully', async ({ page }) => {
    // 1. Setup the Actor with Abilities
    const alice = Actor.named('Alice')
      .with('Browse the Web', BrowseTheWeb.using(page));

    // 2. Perform Tasks
    await alice.attemptsTo(
      NavigateTo.theLoginPage(),
      Login.withCredentials('alice@example.com', 'password123')
    );

    // 3. Ask Questions (Assertions)
    // Example: await alice.asks(Visibility.of('#dashboard'));
  });
});
```

## 4. Implementation Rules
- Never use direct Playwright page calls (e.g., `page.click()`) inside the `.spec.ts` files.
- All page interactions must be encapsulated inside `Task` classes.
- All assertions must be encapsulated inside `Question` classes.
