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

## 3. Test both states
One backend test per state: flag on → the link is present; flag off → it is absent. One component test: no link, no button.

## When not to use this
- **No Spring REST backend** (a Supabase or local-first app): there are no `_links` to carry the flag. Use the platform's own mechanism, recorded as a deviation.
- **A flag that changes no action** (copy, layout): a link is the wrong carrier; return the setting in the resource instead.

## Smells
`if (flags.checkoutV2)` in a React component, a flag name in frontend code, a link built from a concatenated URL string, a flag with no test for its off state.
