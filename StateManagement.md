# Frontend State Management

Modern frontend applications deal with complex state. Treating all state the same leads to bloated, hard-to-maintain codebases. We categorize state into two distinct types: **Server State** and **Client State**.

## 1. Server State
Server state is data that originates from a backend API. It is asynchronous, shared among multiple users, and can become out of sync with the UI if not managed properly.

- **Tool:** **TanStack Query (React Query)**
- **Why:** It handles caching, deduplication of multiple requests for the same data, background updates, pagination, and loading/error states out of the box.
- **Rule:** Do not store server data in global client state (like Redux or Zustand). Let TanStack Query manage it.

## 2. Client State
Client state is data that exists only in the user's browser (e.g., is a modal open, what is the current theme, form input values).

### Local Component State
- For state that is only relevant to a single component or its immediate children, use React's built-in `useState` or `useReducer`.
- Keep state as local as possible.

### Global Client State
- When client state needs to be accessed by many disparate components across the app, use **Zustand** or **React Context**.
- **Zustand** is preferred for frequently updating global state as it prevents unnecessary re-renders better than raw React Context.
- **React Context** is fine for low-frequency updates (like Theme or Auth user info).

## 3. Form State
Forms have unique requirements (validation, touched state, dirty state).
- Use a dedicated form library like **React Hook Form**.
- It integrates seamlessly with validation schemas (like Zod) and manages form state internally without triggering re-renders on every keystroke.

## 4. Immutability
Always treat state as immutable. Do not mutate state objects or arrays directly.
- *Bad:* `state.items.push(newItem)`
- *Good:* `setItems([...state.items, newItem])`
