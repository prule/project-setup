# API Design Guidelines

For projects implementing a REST API Backend, consistency in API design is paramount. It ensures that frontend developers and external consumers can predict how to interact with our system.

## 1. RESTful Principles
- **Use Nouns, Not Verbs:** Endpoints should represent resources.
  - *Good:* `GET /users`, `POST /orders`
  - *Bad:* `GET /getAllUsers`, `POST /createNewOrder`
- **HTTP Methods:**
  - `GET`: Retrieve a resource (idempotent, safe).
  - `POST`: Create a new resource.
  - `PUT`: Fully replace an existing resource (idempotent).
  - `PATCH`: Partially update a resource.
  - `DELETE`: Remove a resource (idempotent).

## 2. HATEOAS (Hypermedia as the Engine of Application State)
As specified in our core architecture, responses should include hypermedia links that guide the client on what actions are possible next, based on the resource's state and the user's permissions.
```json
{
  "id": "123",
  "status": "PENDING",
  "_links": {
    "self": { "href": "/orders/123" },
    "cancel": { "href": "/orders/123/cancel" }
  }
}
```

## 3. Pagination & Filtering
- Never return unbounded lists. Always implement pagination for collection endpoints.
- Use query parameters for filtering, sorting, and pagination.
  - `GET /users?role=admin&sort=-createdAt&page=2&size=20`
- Response payloads for collections should include metadata (total pages, total items, current page).

## 4. Error Handling
Standardize all API error responses using the **RFC 7807 Problem Details** format. This provides a consistent shape for error payloads.
```json
{
  "type": "https://api.example.com/errors/out-of-stock",
  "title": "Out of Stock",
  "status": 409,
  "detail": "Item 456 is no longer available in the requested quantity."
}
```
*Do not expose internal stack traces or database exceptions to the client.*

## 5. Versioning
- Use URI versioning for major, breaking changes (e.g., `/api/v1/users`).
- Non-breaking changes (adding fields, adding endpoints) do not require a version bump.
- Backends must expose a root `/version` or `/actuator/info` endpoint indicating the deployed software version.
