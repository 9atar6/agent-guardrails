---
name: require-form-validation
description: Forms must validate required fields and formats, show field-level error messages, and preserve user input on validation failure. Apply when adding or modifying forms, inputs, or submit flows.
scope: project
severity: warning
triggers:
  - "Adding forms"
  - "Form submit"
  - "Input validation"
  - "Login or signup"
  - "User input fields"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Form Validation

## Trigger
Adding or modifying forms: login, signup, settings, or any UI that collects user input and submits it.

## Instruction
- Validate required fields and formats (e.g. email, length, pattern) before or on submit. Do not send invalid data to the server without surfacing errors to the user.
- Show validation errors next to the relevant fields (inline or under the field), not only at the top of the form. Use clear, actionable messages (e.g. "Enter a valid email" rather than "Invalid input").
- On validation or server error: preserve the user's input so they can correct and resubmit without re-typing. Do not clear the form unless the submission clearly succeeded.
- Use semantic form markup: appropriate input types, `required` where applicable, and associate error text with inputs (e.g. `aria-describedby`, `id`/`htmlFor`) for accessibility.
- Server-side validation remains required for security; client-side validation improves UX and reduces invalid requests.

## Reason
Forms without validation or with poor error handling frustrate users and lead to bad data or abandoned flows. Agents often generate forms that submit without checks or wipe input on error. Field-level validation and preserved input are standard expectations for usable forms.

## Provenance
Manual addition, based on form UX and validation best practices (web.dev, WebAIM).
