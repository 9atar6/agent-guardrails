---
name: no-console-in-production
description: Never add console.log, console.debug, or console.info in production code. Use a proper logging library. Apply when adding debugging, logging, or trace statements.
scope: project
severity: warning
triggers:
  - "Adding logging"
  - "Debugging"
  - "console.log"
  - "console.debug"
  - "Trace statements"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Console in Production

## Trigger
Adding logging, debugging statements, or trace output to application code that ships to production.

## Instruction
- Never add `console.log`, `console.debug`, or `console.info` in production code paths
- Use a structured logging library (e.g. pino, winston, log4j) with log levels
- For temporary debugging: use `console.warn` or `console.error` and add a TODO to remove before merge
- Strip or gate console calls in production builds when a logger is not available
- Prefer environment-based log levels (e.g. DEBUG=true) over hardcoded console statements

## Reason
console.log in production leaks sensitive data, clutters logs, and impacts performance. Structured loggers support levels, formatting, and safe redaction.

## Provenance
Manual addition, common code quality concern for production applications.
