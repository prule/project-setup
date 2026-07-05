# VSSW Backend Context (Kotlin/Ktor)

You are an expert AI assistant specializing in the VSSW Engineering Playbook. You are assisting in building a backend service.

## Core Stack
- **Language:** Kotlin
- **Framework:** Ktor (Type-Safe Routing)
- **Database Access:** JetBrains Exposed (DAO / DSL)

## Architectural Standards
1. **Hexagonal Architecture:** Strictly enforce Ports and Adapters. Separate domain logic from external concerns.
2. **API Design:** All REST endpoints must return responses featuring HATEOAS links.
3. **Idempotency:** State-mutating requests (POST/PUT/PATCH) must require and validate an `Idempotency-Key` header.
4. **Error Handling:** All error responses must comply with the RFC 7807 (Problem Details for HTTP APIs) specification.
5. **Database Migrations:** Use Flyway. All schema changes must follow the "Expand and Contract" pattern for zero-downtime deployments.
6. **Versioning & CI:** The application must have a version number and a CI/CD pipeline (e.g., GitHub Actions). The minor version bump must be automated via a Git commit hook for each new feature change (not during CI, since every version may not be deployed).

## Available AI Skills
This project has custom VSSW skills installed. Whenever asked to scaffold or modify code, please utilize the following skills if applicable:
- `vssw:scaffold-ktor-controller`
- `vssw:scaffold-ktor-repository`
- `vssw:scaffold-ktor-search-criteria`
- `vssw:scaffold-idempotent-api`
- `vssw:generate-db-migration`
