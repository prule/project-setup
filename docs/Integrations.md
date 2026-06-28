# Third-Party Integrations (Build vs. Buy)

We rely on third-party SaaS for undifferentiated heavy lifting (payments, emails, auth), but we must protect our core architecture from vendor lock-in.

## 1. The Build vs. Buy Decision
- **Buy (Subscribe):** If a service solves a problem that is *not* our core competitive advantage (e.g., sending emails via SendGrid, processing credit cards via Stripe, user authentication via Auth0/Supabase), we buy it.
- **Build:** If a feature is the core value proposition of our business, we build it internally.

## 2. The Adapter Pattern (Anti-Corruption Layer)
Never leak third-party SDK code into our core business logic.
- *Bad:* Injecting the `StripeClient` directly into the `OrderService`. If we switch to PayPal, we have to rewrite our entire `OrderService`.
- *Good:* Create an interface in our domain called `PaymentProcessor`. Create a concrete class `StripePaymentProcessor` that implements that interface. The `OrderService` only knows about the `PaymentProcessor` interface.

## 3. Mocking Vendors
Because we use the Adapter Pattern, we can easily create a `MockPaymentProcessor` for our local environments and test suites, allowing developers to work offline without needing sandbox API keys for every third-party service.
