# Styling & CSS Conventions

We use **Tailwind CSS** as our primary styling engine. 

## 1. Design Tokens & Configuration
Never use arbitrary values (e.g., `text-[#ff0000]`). 
- All brand colors, custom typography, and specific breakpoints must be defined centrally in `tailwind.config.js`.
- Use semantic class names for colors (e.g., `bg-primary-500`, `text-error`) rather than descriptive names (`bg-blue-500`, `text-red`). This makes rebranding or theming trivial.

## 2. Component Extraction
Tailwind can lead to "utility class soup" in your JSX.
- If a combination of classes is repeated identically more than 3 times (e.g., a standard button), extract it into a reusable React component (`<Button variant="primary">`).
- **Do not use `@apply`** in custom CSS files to combine Tailwind classes. This defeats the performance benefits of Tailwind's atomic CSS generation. Stick to component extraction in React.

## 3. Dark Mode
- Use Tailwind's `dark:` modifier to support dark mode out of the box.
- Configure Tailwind to use the `class` strategy for dark mode so users can toggle it manually in the app, rather than relying solely on their OS preference.
