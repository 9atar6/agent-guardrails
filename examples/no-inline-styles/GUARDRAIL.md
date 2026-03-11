---
name: no-inline-styles
description: Never add inline styles (style=) to HTML or JSX. Use CSS classes, CSS modules, or design tokens. Apply when styling components or UI.
scope: project
severity: warning
triggers:
  - "Styling components"
  - "Adding UI"
  - "style="
  - "Inline styles"
  - "JSX styling"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Inline Styles

## Trigger
Adding styles to HTML, JSX, or component markup (e.g. React, Vue, Svelte).

## Instruction
- Never add inline `style={{ ... }}` or `style="..."` attributes
- Use CSS classes, CSS modules, Tailwind, or design system tokens instead
- For dynamic values: use CSS variables or data attributes with stylesheets

## Reason
Inline styles scatter styling logic, prevent reuse, and make design consistency harder. They bypass design systems, hurt maintainability, and complicate theming. Centralized styles (CSS, design tokens) enable theming and maintainability.

## Provenance
Manual addition, agent-guardrails reference.
