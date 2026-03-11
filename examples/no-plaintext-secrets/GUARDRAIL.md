---
name: no-plaintext-secrets
description: Never log, commit, or expose API keys, passwords, or tokens. Use environment variables or secrets managers. Apply when adding logging, implementing auth, or integrating third-party APIs.
scope: project
severity: critical
triggers:
  - "Adding logging"
  - "Implementing authentication"
  - "API integration"
  - "Handling credentials"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Plaintext Secrets

## Trigger
Implementing authentication endpoints, adding logging, integrating third-party APIs, or handling any user credentials or API keys.

## Instruction
- Never store, log, or commit plaintext credentials (API keys, passwords, tokens, sessions)
- Always use environment variables or secrets managers (e.g. 1Password, Vault)
- Use bcrypt with 12 salt rounds for password hashing
- Always require HTTPS for authentication endpoints
- Use a `redactSensitive()` helper when logging objects that may contain secrets
- Audit all logs before committing to ensure no credentials are included

## Reason
API keys were exposed in git during a 2025 security audit. Plaintext credentials in logs led to emergency key rotation.

## Provenance
Manual addition, based on guardrails.md case study.
