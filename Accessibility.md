# Accessibility (a11y)

Building software that is accessible to everyone, including those with disabilities, is both an ethical responsibility and a legal requirement. We target **WCAG 2.1 AA** compliance.

## 1. Semantic HTML is King
The easiest way to make a site accessible is to use native HTML elements properly.
- **Bad:** `<div onClick={submit} className="btn">Submit</div>`
- **Good:** `<button onClick={submit}>Submit</button>`
Native elements automatically handle keyboard focus and screen reader announcements.

## 2. Keyboard Navigation
Every interactive element on the screen must be reachable and usable without a mouse.
- You must be able to navigate through all inputs, links, and buttons using only the `Tab` key.
- Focus states must be visually obvious (do not remove `outline` in CSS without providing a high-contrast alternative).

## 3. ARIA Attributes
When building custom interactive components (like modals or dropdowns) where native HTML falls short, use ARIA attributes to communicate the component's state to screen readers.
- Examples: `aria-expanded="true"`, `aria-hidden="true"`, `aria-label="Close dialog"`.

## 4. Color & Contrast
- Text must have a contrast ratio of at least 4.5:1 against its background.
- Never use color as the *only* way to convey information. (e.g., An error state should have a red border *and* an error icon or text message).
