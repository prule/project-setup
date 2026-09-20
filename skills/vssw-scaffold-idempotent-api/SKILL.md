---
name: vssw-scaffold-idempotent-api
description: >
  Scaffolds a REST API endpoint with the house conventions — idempotency keys,
  Problem Details errors and HATEOAS links. Use this skill when asked to create
  a POST, PUT, PATCH or DELETE route in the backend.
---

# Scaffold Idempotent API Skill

House REST conventions. Full rules: `docs/constitution/technologies/spring-boot-api.md`.

**Contract first.** Write or update `openapi.yaml` before the code, generate the server interface, then implement it. Never annotate a controller and let a spec fall out of it.

## 1. Idempotency keys — unsafe POSTs only

`PUT` and `DELETE` are idempotent by definition, and `GET` is safe. **Only `POST` needs a key**, and only where a duplicate would do real damage (payments, orders, anything that charges, ships or notifies). Do not put an `Idempotency-Key` requirement on `PUT`/`PATCH` — it is ceremony that buys nothing.

Client sends `Idempotency-Key: <uuid>`. Server behaviour:

| Key state | Response |
|---|---|
| New | Process, store key → response, return it |
| Already completed | Return the **stored** response. Do not re-execute. |
| Still in flight | `409 Conflict` |

Store keys in a **Postgres table** with the response body and a TTL, written in the same transaction as the work. Redis is not in the default stack — do not introduce it for this.

The key belongs to the user's *intent*, not the network request: it is generated once, before the first attempt, and reused across retries. A key regenerated per retry defeats the whole mechanism.

## 2. Errors — RFC 9457 Problem Details

**RFC 9457** (which obsoletes RFC 7807), media type `application/problem+json`:

```json
{
  "type": "https://api.example.com/errors/out-of-credit",
  "title": "Insufficient credit",
  "status": 403,
  "detail": "Your balance is 30, but that costs 50.",
  "instance": "/accounts/12345"
}
```

- Map domain errors to problem types in one `@RestControllerAdvice` at the adapter.
- `type` is a stable URI and part of the contract — clients branch on it.
- Never expose stack traces, SQL or framework exceptions in `detail`.

## 3. HATEOAS links

Responses carry `_links` for what the caller may do next, **given the resource's state and their permissions**. If the caller may not cancel, omit the `cancel` link — absence is the authorisation signal.

```json
{ "id": "123", "status": "PENDING",
  "_links": { "self": { "href": "/orders/123" },
              "cancel": { "href": "/orders/123/cancel" } } }
```

Build links with Spring HATEOAS (`EntityModel`, `linkTo`), never by concatenating URL strings.

## 4. Also enforce
- Validate request DTOs at the boundary with `jakarta.validation`; domain types validate in their own constructors.
- Never return an unbounded collection — paginate, cap the page size, include totals.
- Resources are nouns: `POST /orders`, not `POST /createOrder`.
- Controllers map DTOs to domain types and delegate. No business logic, and never expose a domain entity directly as JSON.

## Smells
`Idempotency-Key` demanded on a `PUT`, RFC 7807 cited, a bespoke `{"error": "..."}` shape, Redis added solely for idempotency, a retried payment charging twice, a `cancel` link the caller cannot use, an unpaginated list endpoint.
