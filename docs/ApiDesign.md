# API Design Guidelines

For projects implementing a REST API Backend, consistency in API design is paramount. It ensures that frontend developers and external consumers can predict how to interact with our system.

## 1. RESTful Principles
- **Use Nouns, Not Verbs:** Endpoints should represent resources.
  - *Good:* `GET /users`, `POST /orders`
  - *Bad:* `GET /getAllUsers`, `POST /createNewOrder`
- **HTTP Methods & Behaviors:**
  - **`GET`**: Retrieve a resource or collection. (Safe & Idempotent).
    - *Example:* `GET /users/123` returns the user's data.
  - **`POST`**: Create a *new* resource under a collection. It is NOT idempotent.
    - *Example:* `POST /users` with a body like `{"name": "Alice"}`. The server assigns the ID and creates `/users/124`.
  - **`PUT`**: Fully *replace* an existing resource. It IS idempotent. You must send the entire resource representation. If a field is omitted from the payload, it must be set to null/empty on the server.
    - *Example:* `PUT /users/123` with `{"name": "Bob", "email": "bob@example.com"}`. If the user previously had a `phone` number but it's not in this payload, the phone number is deleted.
  - **`PATCH`**: Partially update a resource. You only send the fields that need to change.
    - *Example:* `PATCH /users/123` with `{"email": "new.bob@example.com"}`. The user's name and phone number remain untouched.
  - **`DELETE`**: Remove a resource. (Idempotent).
    - *Example:* `DELETE /users/123` deletes the user. Running it again might return a `404 Not Found` (or `204 No Content`), but the end state is the same: the user is gone.

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

## 6. Idempotency & Safe Retries
To safely handle network drops, frontend clients will often automatically retry requests. While `GET`, `PUT`, and `DELETE` are naturally idempotent, `POST` requests (like creating an order or submitting a payment) are not.

To prevent unintended side effects (like double-charging a user) on retried `POST` requests:
- **Idempotency Keys:** The client must generate a unique UUID for the transaction and send it via an HTTP header (e.g., `Idempotency-Key: <UUID>`).
- **Backend Handling:** The backend must check this key against a fast datastore (like Redis or a dedicated table) before processing:
  - If the key is *new*, process the request, cache the successful response body against the key, and return it.
  - If the key is *already processed*, do not execute the business logic again. Simply return the cached response.
  - If the key is *currently processing* (a race condition from a double-click), lock and return a `409 Conflict` (or wait for the first process to finish).

### Frontend Implementation (Generating the Key)
If the frontend generates a new key on every retry, the idempotency mechanism fails. The key must be tied to the *intent* of the user action, not the network request itself.

- **Generation:** Use the native browser cryptography API: `crypto.randomUUID()`.
- **Automatic Retries:** Generate the key *before* passing the request to your HTTP client/fetcher (e.g., TanStack Query). If the client automatically retries due to a network drop, it will simply resend the exact same headers it was given initially.
- **Double-Clicks:** To prevent generating multiple keys if a user frantically double-clicks a submit button, store the generated key in a React `useRef` upon the first click, or immediately disable the submit button.
- **Surviving Page Reloads:** If preserving the transaction intent across a hard browser refresh is critical, store the generated UUID in `sessionStorage` until a success response is received, or use an existing, related entity ID (like a pre-generated `order_id`) as the idempotency key.
