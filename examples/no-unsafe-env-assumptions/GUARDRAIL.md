---
name: no-unsafe-env-assumptions
description: Never assume environment variables exist without validation. Validate required env vars at startup and fail fast with clear errors. Apply when using process.env, os.environ, or config that depends on env.
scope: project
severity: critical
triggers:
  - "Environment variables"
  - "process.env"
  - "os.environ"
  - "Configuration"
  - "Startup"
  - "Config loading"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Unsafe Env Assumptions

## Trigger
Using environment variables, loading configuration from env, or any code that reads `process.env`, `os.environ`, or similar at runtime.

## Instruction
- Never assume required environment variables exist; validate at startup or first use
- For required vars: fail fast with a clear error message (e.g. "Missing required env: API_KEY. Add it to .env or set it before starting.")
- Use a config validation step (e.g. check all required vars before the app starts) instead of failing later with cryptic "undefined" errors
- Document required env vars in .env.example or README
- For optional vars: provide sensible defaults or handle absence explicitly

## Reason
Code that assumes env vars exist fails at runtime with unclear errors (e.g. "Cannot read property of undefined"). Validating at startup surfaces configuration problems immediately with actionable messages.

## Provenance
Manual addition, complements no-placeholder-credentials (don't invent values; validate when using).
