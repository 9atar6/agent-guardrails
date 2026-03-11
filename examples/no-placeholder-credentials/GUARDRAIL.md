---
name: no-placeholder-credentials
description: Never use fake or placeholder API keys, env vars, or credentials. Ask for real values instead of inventing them. Apply when configuring APIs, integrations, or environment variables.
scope: project
severity: critical
triggers:
  - "API integration"
  - "Environment variables"
  - "API key"
  - "Configuration"
  - "Credentials"
  - "Placeholder"
  - ".env"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Placeholder Credentials

## Trigger
Configuring API integrations, environment variables, credentials, or any code that requires API keys, tokens, or secrets.

## Instruction
- Never use fake, placeholder, or invented credentials (e.g. `sk_test_placeholder`, `your-api-key-here`, `xxx`)
- Never assume env vars exist without validation; ask the user to provide or verify values
- When a real value is required: stop and ask the user to provide it, or add it to .env
- Document required env vars in .env.example with placeholders for format only (e.g. `STRIPE_KEY=sk_test_...`), not for actual use
- For local development: use real test keys when available (e.g. Stripe test mode, sandbox APIs), or explicitly ask the user

## Reason
Agents hallucinate placeholder values that appear to work but fail in production. Users assume the agent configured correctly when it did not. Always ask for real values when they are required.

## Provenance
Manual addition, common failure mode in autonomous coding agents (DAPLab).
