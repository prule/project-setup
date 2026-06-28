# Feature Flags & Dark Launching

To maintain a deployable `main` branch, we must be able to merge incomplete features without exposing them to users. We achieve this using **Feature Flags**.

## 1. What is Dark Launching?
Dark launching is the practice of deploying a feature to production but wrapping it in a conditional toggle (a feature flag) so it is hidden from standard users. 

## 2. When to Use Feature Flags
- When a feature takes longer to build than a single PR.
- When performing a risky migration and you need a "kill switch" to instantly revert without rolling back a deployment.
- When you want to roll a feature out to internal staff first (Beta testing) before exposing it to the public.

## 3. Implementation Patterns

### Pattern 1: HATEOAS-Driven Flags (Preferred)
Because our backend is RESTful and uses **HATEOAS** (Hypermedia as the Engine of Application State), the most elegant way to handle feature flags is to drive them directly from the API links. 

Instead of the frontend querying a separate flag service (e.g., `isFeatureEnabled('new-checkout')`), the backend evaluates the flag. If the feature is enabled for that user, the backend includes the relevant action link in the `_links` object. If the feature is disabled, the link is simply omitted.

```json
// Backend evaluation: if (flags.isCheckoutV2Enabled) { addLink("checkout_v2") }
{
  "id": "123",
  "status": "CART",
  "_links": {
    "self": { "href": "/cart/123" },
    "checkout_v2": { "href": "/cart/123/checkout/v2" } // Omitted if feature is turned off
  }
}
```
The frontend simply checks for the existence of the link to decide what UI to render:
```tsx
{cart._links.checkout_v2 ? <CheckoutV2 url={cart._links.checkout_v2.href} /> : <CheckoutV1 />}
```
This centralizes the logic in the backend, meaning you don't have to duplicate flag evaluations across the web frontend, iOS app, and Android app.

### Pattern 2: Global UI Toggles (Fallback)
If a feature does not correspond directly to a REST resource (e.g., a global UI redesign like a new Navigation Bar), the frontend will need to fetch global flags from a configuration endpoint and render conditionally:
```tsx
{flags['new-nav-bar'] ? <NavigationBarV2 /> : <NavigationBarV1 />}
```

### Pattern 3: API Guards
Always secure new backend endpoints. Even if the frontend UI is hidden, a malicious user could guess the URL. If the backend flag is disabled, the new endpoint must return a `404 Not Found` or `403 Forbidden`.

## 4. The Flag Lifecycle (Avoiding Tech Debt)
Feature flags represent temporary technical debt. 
- **Expiration:** A feature flag must be removed from the codebase within **14 days** of the feature being fully rolled out to 100% of users.
- **Cleanup:** Delete the old code path (`CheckoutV1`), remove the conditional logic, and delete the flag from the configuration system.
