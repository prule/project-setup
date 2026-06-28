# Timezones, Currency & Localization

Handling global data incorrectly will corrupt data and frustrate users. Follow these strict rules.

## 1. The Golden Rule of Time
**All dates and times must be stored in the database in UTC.**
- The backend API should always return ISO-8601 strings in UTC (e.g., `2026-06-27T17:33:34Z`).
- The frontend is solely responsible for parsing that UTC time and formatting it into the user's local timezone (e.g., using `Intl.DateTimeFormat` or a library like `date-fns`).

## 2. Handling Currency
Never use floating-point numbers (e.g., `float`, `double`) to represent money, as floating-point math leads to rounding errors (`0.1 + 0.2 = 0.30000000000000004`).
- **Store as Integers:** Store all monetary values in the database as the smallest denomination of that currency (e.g., cents). `$10.50` is stored as `1050`.
- **Formatting:** Use the browser's native `Intl.NumberFormat` to display the integer as a localized currency string.

## 3. Internationalization (i18n)
- Do not hardcode user-facing strings in the codebase if the app requires multi-language support.
- Use an i18n library (like `react-i18next`) and extract strings into translation files (e.g., `en.json`, `es.json`).
