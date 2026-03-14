---
name: require-loading-and-error-states
description: When adding async UI (data fetch, form submit, mutation), always implement visible loading and error states. No silent failures or blank screens. Apply when adding fetch, useQuery, API calls in components, or any async user flow.
scope: project
severity: warning
triggers:
  - "Data fetching in UI"
  - "Form submit or mutation"
  - "useQuery, useEffect fetch"
  - "Async component or page"
  - "Loading data from API"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Loading and Error States

## Trigger
Adding or modifying UI that depends on async work: fetching data, submitting forms, calling APIs, or any operation that can take time or fail.

## Instruction
- For every async flow: show a loading state (spinner, skeleton, or disabled button) while the operation is in progress.
- For every async flow: handle errors and show the user a clear message and, where appropriate, a retry or recovery action. Do not leave a blank screen or silent failure.
- Prefer local loading indicators (e.g. per section or button) over blocking the whole screen when only one part is loading.
- For errors: display user-friendly text (what went wrong, what to do next) and avoid raw stack traces or generic "Error" only.
- When the user asks to "add a fetch" or "load data": include loading and error handling in the same change; do not leave them as "TODO" or omit them.

## Reason
Agents often generate happy-path UI only. Missing loading and error states lead to blank screens, confusion, and support burden. Users tolerate waiting when they see progress; they lose trust when the app hangs or fails with no feedback. Consistent loading and error handling is expected in production UIs.

## Provenance
Manual addition, based on frontend UX and resilience practices.
