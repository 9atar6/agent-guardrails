---
name: require-design-tokens
description: Use design tokens (CSS variables, theme primitives, or design-system constants) for colors, spacing, and typography in UI. Do not hardcode hex colors, pixel spacing, or font sizes in components. Apply when styling components or adding new UI.
scope: project
severity: warning
triggers:
  - "Styling components"
  - "Colors or spacing"
  - "Typography or font size"
  - "Theme or dark mode"
  - "Adding UI styles"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Design Tokens

## Trigger
Adding or changing visual styling: colors, spacing, typography, borders, or shadows in components or pages.

## Instruction
- Do not hardcode hex/rgb colors, raw pixel spacing, or font sizes in components. Use design tokens or theme variables (e.g. `var(--color-primary)`, `var(--spacing-md)`, theme object from the design system).
- If the project has a token file or design system: use its tokens for all new UI. If it does not: introduce a small set of variables (e.g. in CSS or a theme module) and use those instead of magic values.
- Prefer semantic tokens (e.g. `--color-text`, `--color-background`) over raw primitives when the project uses them, so theming and dark mode can switch consistently.
- For one-off or prototype screens: still prefer variables over raw values so the codebase can adopt tokens later without a full rewrite.

## Reason
Hardcoded colors and spacing scatter design decisions, block theming and dark mode, and make consistency harder. Design tokens centralize visual decisions and keep the UI aligned with the design system. Agents often emit arbitrary hex and pixel values; requiring tokens keeps the codebase maintainable and theme-ready.

## Provenance
Manual addition, based on design system and theming practices.
