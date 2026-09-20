---
name: vssw-scaffold-playwright-screenplay-test
description: >
  Scaffolds an end-to-end (E2E) test using Playwright and the Serenity/JS
  Screenplay pattern. Use this skill whenever asked to write an E2E test,
  UI test, acceptance test, or Playwright test for a frontend application.
---

# Scaffold Playwright Screenplay Test Skill

E2E tests use **Serenity/JS** (`@serenity-js/*`) for the Screenplay pattern. Not `@testla/screenplay`, not raw Playwright page objects.

Full reasoning: `docs/constitution/patterns/screenplay.md`.

## 1. Why Screenplay over Page Objects
Screenplay decouples the *intent* of the test ("the user bookmarks an entry") from the *mechanics* ("click `#bm-btn`"). Page objects grow into large classes mixing locators, navigation and business logic, and are organised around pages, so a journey crossing five pages gets stitched together in the test. Screenplay composes tasks instead, so a UI change touches one interaction rather than every test that walked through it.

## 2. Packages
```
@serenity-js/core  @serenity-js/playwright  @serenity-js/playwright-test
@serenity-js/web   @serenity-js/assertions  @serenity-js/console-reporter
```

## 3. Shared harness
Create `e2e/screenplay/serenity.ts` once. Every spec imports `describe`/`it` from here, never from `@playwright/test`:

```typescript
import { Cast, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { describe, it, test as base } from '@serenity-js/playwright-test';

const test = base.extend({});

test.use({
  actors: async ({ browser, contextOptions }, use) => {
    await use(
      Cast.where((actor) =>
        actor.whoCan(
          BrowseTheWebWithPlaywright.using(browser, contextOptions),
          TakeNotes.usingAnEmptyNotepad(),
        ),
      ),
    );
  },
});

export { describe, it, test };
export { expect } from '@serenity-js/playwright-test';
```

Register the reporter in `playwright.config.ts`:
```typescript
reporter: [['@serenity-js/playwright-test', { crew: ['@serenity-js/console-reporter'] }]],
```

## 4. Directory structure
```
e2e/
  screenplay/
    serenity.ts      the shared harness above
    <domain>.ts      custom tasks and questions, named for the domain
  *.spec.ts          the scenarios
```

## 5. Writing a spec
```typescript
import { Ensure, isPresent } from '@serenity-js/assertions';
import { By, Click, Navigate, PageElement } from '@serenity-js/web';
import { describe, it } from './screenplay/serenity';

const bookmarkButton = PageElement.located(By.css('[data-test="bookmark"]'))
  .describedAs('the bookmark button');

describe('Bookmarks', () => {
  it('lets a reader bookmark an entry', async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to('/'),
      Click.on(bookmarkButton),
      Ensure.that(bookmarkButton, isPresent()),
    );
  });
});
```

## Rules
- The spec body contains **tasks and questions only**. No `page.` calls, no raw locators inline, no waits.
- Only abilities and interactions touch Playwright. Nothing else imports `Page`.
- Name tasks for the user's goal in the domain's language (`PlaceAnOrder`), never for mechanics (`ClickCheckoutButton`).
- Tasks return nothing; reading state is a Question's job.
- Use `.describedAs(...)` on every `PageElement` — it is what makes the report readable.
- Prefer role- and label-based locators over CSS paths.
- Never `waitForTimeout`. Serenity/JS and Playwright wait for you.
- Keep E2E to a few critical journeys. Screenplay makes tests cheap to write, which is not a licence to push logic coverage up the pyramid.

## Smells
`@testla/screenplay` or `@playwright/test` imported in a spec, `page.click(...)` in a test, a `LoginPage` class with twenty methods, tasks named after buttons, `waitForTimeout`, a `PageElement` with no description.
