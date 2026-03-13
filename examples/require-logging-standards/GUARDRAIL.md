---
name: require-logging-standards
description: Enforce structured, consistent logging without leaking secrets or sensitive personal data. Apply when adding or changing logging, metrics, or observability.
scope: project
severity: warning
triggers:
  - "Adding or changing logging"
  - "Instrumenting new features"
  - "Adding metrics or observability"
  - "Handling errors or exceptions"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Logging Standards

## Trigger
Adding or modifying logging, metrics, or observability for any feature, endpoint, job, or background task.

## Instruction
- Prefer structured logging helpers (fields, context objects) over ad-hoc string concatenation.
- Never log secrets, access tokens, passwords, raw request bodies, or other highly sensitive personal data.
- Use clear log levels (debug, info, warn, error) and avoid noisy debug logs in hot paths for production.
- When logging errors, include enough context to debug (operation, identifiers) without leaking secrets or full raw payloads.

## Reason
Inconsistent, unstructured logs make debugging slow and fragile, and logging secrets or sensitive data can turn telemetry into a liability. Clear standards keep logs safe, useful, and affordable.

## Provenance
Manual addition, informed by production logging and incident review practices.

