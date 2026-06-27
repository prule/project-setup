# Testing Strategy

Automated testing is critical to our development lifecycle. It gives us the confidence to refactor, upgrade dependencies, and deploy frequently.

## 1. The Test Pyramid
We aim for a healthy balance of tests:
- **Unit Tests (Many):** Test individual functions, classes, or React components in isolation. Fast to write, fast to run.
- **Integration Tests (Some):** Test how multiple units work together (e.g., a Use Case talking to a real Database repository).
- **E2E Tests (Few):** Test the entire system from the user's perspective, running in a real browser against a real environment.

## 2. Frontend Testing
- **Tool:** Vitest for Unit/Integration, Playwright for E2E.
- **Component Testing:** Use React Testing Library. Focus on testing *behavior* (what the user sees and interacts with) rather than *implementation details* (internal component state).
- **E2E with Serenity BDD:** Use the Screenplay Pattern to write business-readable, maintainable tests. E2E tests should verify critical user journeys (e.g., user signup, checkout flow).

## 3. Backend Testing
- **Mocking:** Mock external services (e.g., third-party APIs) to keep tests deterministic.
- **Database Testing:** Avoid mocking the database. Use **Testcontainers** to spin up a real PostgreSQL instance via Docker for repository and integration tests. This ensures your SQL and migrations actually work.

## 4. Test-Driven Development (TDD)
While not strictly mandated for every single line of code, TDD is highly encouraged, especially for complex business logic.
1. **Red:** Write a failing test.
2. **Green:** Write the simplest code to make it pass.
3. **Refactor:** Clean up the code while the test keeps you safe.

## 5. Test Quality
- Tests should follow the **Arrange, Act, Assert** (or Given, When, Then) structure.
- Tests must be deterministic. Flaky tests (tests that pass/fail randomly without code changes) must be fixed or deleted immediately, as they erode trust in the CI pipeline.
