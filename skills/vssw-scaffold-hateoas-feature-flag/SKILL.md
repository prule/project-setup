---
name: vssw-scaffold-hateoas-feature-flag
description: >
  Puts a feature behind a flag the HATEOAS way in a Spring Boot REST API: the
  backend evaluates the flag and adds a link, the React client renders on the
  link's presence. Use when asked to hide a feature behind a toggle in a project
  with a Spring Boot backend that returns _links.
---

# Scaffold HATEOAS Feature Flag Skill

The rule: **feature flags are links** (`docs/constitution/technologies/spring-boot-api.md`). The backend is the only place a flag is evaluated; no flag logic ships to the browser.

## 1. Backend
Evaluate the flag where the resource's links are built, alongside the permission checks — a flag is one more reason a link is present or absent.

```kotlin
fun toModel(order: Order, user: User): EntityModel<OrderDto> =
  EntityModel.of(order.toDto()).apply {
    add(linkTo<OrderController> { get(order.id) }.withSelfRel())
    if (flags.isEnabled("checkout-v2", user)) add(linkTo<CheckoutController> { start(order.id) }.withRel("checkout_v2"))
  }
```

## 2. Frontend
The component checks for the link and uses its `href`. It never reads a flag, a config value or an environment variable.

```tsx
{order._links.checkout_v2 && <Button onClick={() => post(order._links.checkout_v2.href)}>Check out</Button>}
```

## 3. Guard the endpoint
Hiding the link does not stop a caller who guesses the URL. When the flag is off, the endpoint itself returns `404 Not Found` (or `403 Forbidden` when the caller may know it exists), checked in the same place as the link.

## 4. Test both states
Backend: flag on → the link is present and the endpoint works; flag off → the link is absent and the endpoint returns 404. Component: no link, no button.

## When not to use this
- **No Spring REST backend** (a Supabase or local-first app): there are no `_links` to carry the flag. Use the platform's own mechanism, recorded as a deviation.
- **A flag that is not about one resource** (a new navigation bar, a redesign): put the link on the API's root resource (`GET /`), which the app loads at start-up — still a link, still evaluated by the backend.

## Smells
`if (flags.checkoutV2)` in a React component, a flag name in frontend code, a link built from a concatenated URL string, a hidden link whose endpoint still answers, a flag with no test for its off state.
