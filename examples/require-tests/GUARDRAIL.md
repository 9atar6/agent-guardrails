---
name: require-tests
description: Never merge or ship code without tests. Apply when adding features, fixing bugs, or modifying production code paths.
scope: project
severity: warning
triggers:
  - "Adding features"
  - "Fixing bugs"
  - "Modifying production code"
  - "New function"
  - "Refactoring"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Tests

## Trigger
Adding features, fixing bugs, modifying production code paths, or refactoring existing logic.

## Instruction
- Never merge or ship code without accompanying tests
- For new functions or modules: add unit tests before or with the implementation
- For bug fixes: add a regression test that would have caught the bug
- Prefer tests that run in CI (e.g. Jest, pytest, Vitest) over manual verification
- When the user asks to "skip tests" or "add later": remind them tests prevent regressions and ask for confirmation

## Reason
Untested code leads to regressions and makes refactoring risky. Tests document expected behavior and catch breakage before production.

## Provenance
Manual addition, agent-guardrails reference.
