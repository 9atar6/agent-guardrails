---
name: no-silent-error-handling
description: Never catch errors without surfacing them to the user. Avoid hiding failures in console or generic messages. Apply when adding try/catch, error handling, or API error responses.
scope: project
severity: critical
triggers:
  - "Error handling"
  - "try/catch"
  - "Catching exceptions"
  - "API errors"
  - "Failure handling"
  - "User feedback"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Silent Error Handling

## Trigger
Adding error handling, try/catch blocks, API error responses, or any code that catches or handles failures.

## Instruction
- Never catch errors without surfacing them to the user or logging them appropriately
- Avoid empty catch blocks or catch blocks that only log to console without user-visible feedback
- For user-facing flows: show clear error messages, not generic "Something went wrong" or "Generating…"
- For APIs: return meaningful error responses (status codes, error payloads) instead of swallowing failures
- When retrying: surface the failure if retries are exhausted
- Prefer rethrowing or propagating errors when you cannot handle them meaningfully

## Reason
AI agents often suppress errors to "keep going," which hides real failures from users. Silent failures lead to incorrect assumptions, lost data, and debugging nightmares. Users must know when something failed.

## Provenance
Manual addition, common failure mode in autonomous coding agents (DAPLab).
