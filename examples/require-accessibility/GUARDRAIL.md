---
name: require-accessibility
description: Never ship UI without alt text for images, ARIA where needed, keyboard support, and sufficient contrast. Apply when adding images, forms, modals, or interactive components.
scope: project
severity: warning
triggers:
  - "Adding images"
  - "Adding forms"
  - "Modals"
  - "Interactive components"
  - "Custom UI"
  - "Buttons"
  - "Links"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Accessibility

## Trigger
Adding images, forms, modals, custom interactive components, buttons, or any UI that users interact with.

## Instruction
- Always add meaningful `alt` text for images; use empty `alt=""` only for purely decorative images
- Add ARIA attributes where native semantics are insufficient (e.g. `aria-label`, `aria-describedby`, `role`)
- Ensure interactive elements are keyboard accessible (focusable, operable via Tab/Enter/Space)
- Maintain focus management in modals (trap focus, return focus on close)
- Ensure sufficient color contrast (WCAG AA minimum); do not rely on color alone to convey information
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.) before reaching for divs with roles

## Reason
Accessibility is often overlooked by agents. Missing alt text, poor keyboard support, and low contrast exclude users and create legal risk. Fixing a11y later is costlier than building it in from the start.

## Provenance
Manual addition, agent-guardrails reference.
