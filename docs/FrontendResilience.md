# Frontend Resilience & Offline Support

Our applications must be robust. A failure in the network or the backend should degrade gracefully in the frontend, rather than crashing the user's browser.

## 1. React Error Boundaries
Never let an entire application crash because one component threw an exception.
- Wrap major page sections (e.g., Sidebar, Main Content, Checkout Flow) in **Error Boundaries**.
- If a component fails to render, the Error Boundary will catch it and display a localized fallback UI (e.g., "This widget failed to load") while the rest of the application remains functional.

## 2. Handling API Failures
- **Don't show raw errors:** Never display a raw 500 error string to the user. Show a friendly fallback ("We're having trouble connecting to the server right now. Please try again.").
- **Retries:** Use **TanStack Query** to automatically retry failed idempotent `GET` requests (e.g., retry 3 times with exponential backoff before failing).
- **Mutations:** For `POST`/`PUT` requests, do not auto-retry unless you have implemented strong Idempotency Keys (see `ApiDesign.md`), to prevent double-charging or duplicate entries.

## 3. Offline-First (PWA)
If building a local-first PWA:
- The Service Worker must cache all static assets (HTML, JS, CSS) so the app boots instantly even with no Wi-Fi.
- Use **IndexedDB (Dexie.js)** to store the user's data locally. 
- When the network returns, implement a background sync process to push local changes to the cloud.
