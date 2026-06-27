# Security Practices

Security must be treated as a first-class citizen in the development lifecycle, not an afterthought.

## 1. Secrets Management
- **Never Commit Secrets:** Passwords, API keys, and private certificates must never be committed to version control.
- **Environment Variables:** Use `.env` files for local development, but ensure `.env` is added to `.gitignore`.
- **Production Secrets:** Inject secrets into the production environment via the CI/CD pipeline or a dedicated secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, Cloudflare Secrets).

## 2. Authentication & Authorization
- **Authentication (Who are you?):** Use industry-standard protocols like OAuth2 or OIDC. Do not roll your own cryptography or password hashing algorithms. If storing passwords, use Argon2 or bcrypt.
- **Authorization (What can you do?):** Validate permissions on *every* protected backend request. Do not rely solely on the frontend to hide UI elements; the backend is the final authority.
- **JWT Best Practices:** If using JWTs, keep their lifespans short. Use refresh tokens to obtain new access tokens.

## 3. Protecting Against OWASP Top 10
- **SQL Injection:** Never concatenate strings to build SQL queries. Always use parameterized queries (built into JPA/Hibernate, Exposed, etc.).
- **XSS (Cross-Site Scripting):** React generally protects against XSS by escaping values rendered in JSX. Never use `dangerouslySetInnerHTML` unless absolutely necessary and the input has been aggressively sanitized (e.g., using DOMPurify).
- **CSRF (Cross-Site Request Forgery):** If using session cookies for API authentication, ensure anti-CSRF tokens are implemented or `SameSite=Strict` is configured on the cookies.

## 4. Dependency Scanning
- Regularly audit dependencies for known vulnerabilities.
- Tools like GitHub Dependabot or `npm audit` should be enabled to alert the team to vulnerable packages.

## 5. Principle of Least Privilege
Services, databases, and CI/CD pipelines should only have the minimum permissions necessary to perform their function.
