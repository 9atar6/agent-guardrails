---
name: no-hardcoded-user-facing-strings
description: Never hardcode user-facing text (labels, messages, errors) in components or views. Use i18n keys, translation files, or shared constants. Apply when adding UI text, error messages, or form labels.
scope: project
severity: warning
triggers:
  - "Adding UI text"
  - "Error messages"
  - "Form labels"
  - "User-facing strings"
  - "Button text"
  - "Placeholders"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Hardcoded User-Facing Strings

## Trigger
Adding user-facing text: labels, buttons, error messages, placeholders, tooltips, or any string displayed to the user in the UI.

## Instruction
- Never hardcode user-facing strings directly in components or views
- Use i18n/translation keys (e.g. t('errors.network'), i18n.t('submit')) when the project has i18n
- If no i18n: use shared constants or a strings module (e.g. STRINGS.ERROR_NETWORK) for reuse and consistency
- For error messages: centralize in a shared location so they can be updated and translated
- Exception: very small projects or prototypes may use inline strings; prefer externalizing as the project grows

## Reason
Hardcoded strings scatter copy across the codebase, block localization, and make consistent messaging harder. Centralized strings enable i18n and easier content updates.

## Provenance
Manual addition, agent-guardrails reference.
