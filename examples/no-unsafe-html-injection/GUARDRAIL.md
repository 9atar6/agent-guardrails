---
name: no-unsafe-html-injection
description: Never inject raw or unsanitized HTML into the DOM. Avoid dangerouslySetInnerHTML, innerHTML, v-html, or similar unless content is sanitized with an allowlisted sanitizer. Apply when rendering user or external content as HTML.
scope: project
severity: critical
triggers:
  - "Rendering HTML from user input"
  - "dangerouslySetInnerHTML"
  - "innerHTML"
  - "v-html"
  - "Rich text or markdown to HTML"
  - "Third-party or API content in UI"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Unsafe HTML Injection

## Trigger
Rendering HTML in the UI: user-provided content, API responses, markdown converted to HTML, or any string that will be inserted into the DOM as HTML.

## Instruction
- Never use `dangerouslySetInnerHTML`, `innerHTML`, `v-html`, or equivalent with unsanitized or untrusted content.
- If you must render HTML from external or user sources: sanitize with an allowlisted library (e.g. DOMPurify) and restrict allowed tags and attributes.
- Prefer safe alternatives: plain text, React/Vue text nodes, or a markdown renderer that outputs safe elements only.
- Do not rely on regex or simple string replacement for sanitization; use a dedicated sanitization library.
- When the user asks to "render HTML" or "show formatted content": clarify the source (trusted vs untrusted) and use the appropriate safe path.

## Reason
Raw HTML injection is a primary XSS vector. Agents often generate code that dumps user or API content into the DOM without sanitization, enabling script injection, credential theft, and session hijacking. Browsers execute script in injected HTML; the only safe approach is to never inject unsanitized HTML or to sanitize with a strict allowlist.

## Provenance
Manual addition, based on XSS and React/Vue security guidance (OWASP, framework docs).
