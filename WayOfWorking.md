# The Way of Working (Process & Planning)

How we manage work is just as important as how we write code.

## 1. The Anatomy of a Good Ticket
A Jira/Linear ticket must contain enough context that a developer can pick it up without asking the author for clarification.
- **For Bugs:** Must include "Steps to Reproduce", "Expected Behavior", and "Actual Behavior".
- **For Features:** Must include clear "Acceptance Criteria" (e.g., "Given X, When I do Y, Then Z happens").

## 2. Definition of Done (DoD)
A task is not "Done" when the code works locally. A ticket can only be moved to Done when:
1. Code is written and self-reviewed.
2. Unit / Integration tests are written and passing in CI.
3. Code has been reviewed and approved by at least one peer.
4. The PR is merged into `main`.
5. If hidden behind a feature flag, the flag has been verified in the production environment.

## 3. Continuous Deployment
We do not have "release days". Code merged into `main` should be automatically deployed to production via our CI/CD pipeline. To support this, all work must adhere to our `GitWorkflow.md` and `FeatureFlags.md` guidelines.
