---
name: vssw-integrate-google-form
description: >
  Collects simple user input — feedback, a support message, a survey, a
  waitlist, register-interest or newsletter email — through a Google Form
  behind a native React form, instead of a custom table or API. Use whenever
  asked to add feedback, a support form, a survey, a waitlist or email capture.
---

# Integrate Google Form Skill

Build vs buy (`docs/Integrations.md`): collecting a message or an email is not the product, so do not build tables, routes or models for it. A Google Form behind the app's own UI is enough.

## 1. Say what you are doing
Tell the user you are using a Google Form, and that they need to create it, link a Sheet, and give you its `formResponse` URL and the `entry.<id>` of each field (from the form's pre-filled link).

## 2. Native UI
Never show the Google Form itself (no iframe, no new tab). Build a React form with the app's design system: a dialog with a message box and optional email for **feedback**; one email field and a "Notify me" button for **register interest**, with native email validation.

## 3. Send only what the form needs
`docs/constitution/principles/least-privilege.md` applies to data too. Send the message and, if the user typed it, their email. Add context (`currentUrl`, `appVersion`) only if the user asked for it, and never an account id or other personal data without a privacy note next to the form saying it goes to Google.

## 4. Submit with a `no-cors` POST
```typescript
export async function submitToForm(formResponseUrl: string, fields: Record<string, string>) {
  const body = new FormData();
  for (const [entry, value] of Object.entries(fields)) body.append(entry, value);
  // no-cors lets the cross-origin POST through; the response is opaque, so not throwing is success.
  await fetch(formResponseUrl, { method: 'POST', mode: 'no-cors', body });
}
```

On a thrown network error, tell the user it could not be sent (for **feedback**: "Your feedback couldn't be sent"; for **register interest**: "We couldn't add you to the list") and keep what they typed.

## 5. Verify in the Sheet
An opaque response also "succeeds" when an `entry.<id>` is wrong — the answer is silently dropped. Before calling it done, send one test submission and confirm every field arrived in the linked Sheet. Put the field ids in one constant, not scattered through the component.

## When not to use this
The input drives the product (orders, accounts), needs a reply inside the app, or must stay out of Google for legal reasons. Then it is product data: model it properly.

## Smells
An iframe of the Google Form, a `feedback` table built for a contact form, `entry.123456` repeated across files, a user id sent with no privacy note, a form never checked in its Sheet.
