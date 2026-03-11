---
name: no-magic-numbers
description: Never use unexplained numeric literals in code. Use named constants or config. Apply when adding timeouts, limits, sizes, or thresholds.
scope: project
severity: warning
triggers:
  - "Adding timeouts"
  - "Setting limits"
  - "Buffer sizes"
  - "Retry counts"
  - "Thresholds"
  - "Numeric literals"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Magic Numbers

## Trigger
Adding numeric literals for timeouts, limits, buffer sizes, retry counts, thresholds, or other configuration values.

## Instruction
- Never use unexplained numeric literals (e.g. `5000`, `3`, `1024`) in business logic
- Use named constants (e.g. `MAX_RETRIES`, `TIMEOUT_MS`, `PAGE_SIZE`) or config
- Document the meaning and unit (ms, seconds, bytes) in the constant name or comment
- For common values: define once and reuse

## Reason
Magic numbers make code hard to understand and change. Named constants document intent and centralize configuration.
