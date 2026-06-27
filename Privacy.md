# Data Privacy & Compliance

We must protect our users' data and comply with global privacy frameworks like GDPR and CCPA.

## 1. Data Minimization
Never collect or store personal data that is not strictly necessary for the application's core functionality. If you don't store it, it can't be breached.

## 2. Hard vs. Soft Deletes (Right to be Forgotten)
When a user requests their account be deleted, we must balance their "Right to be Forgotten" against our need for financial/analytical integrity.
- **Soft Deletion:** Do not perform a SQL `DELETE` on the user record. Instead, anonymize the PII fields (e.g., change `name` to `Deleted User`, `email` to `deleted-123@example.com`) and flip an `is_deleted = true` flag.
- **Orphaned Records:** This ensures that linked records (like past orders or payments) do not break due to foreign key constraints, while successfully purging the user's personal identity.

## 3. Encryption at Rest
All databases must be configured to use encryption at rest. If a bad actor gains access to the physical hard drives, the data must remain unreadable.
