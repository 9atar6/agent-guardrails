---
name: rate-limiting
description: Limit tool calls and API requests to prevent runaway loops. Max 50 tool calls per session, max 10 per iteration. Stop after 3 consecutive errors.
scope: session
severity: warning
triggers:
  - "Debugging API integrations"
  - "Stripe or payment API calls"
  - "External API calls in loops"
  - "Context window approaching capacity"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Rate Limiting

## Trigger
Debugging API integrations, making repeated external API calls, or when context exceeds 80% capacity or 10+ consecutive errors.

## Instruction
- Max 50 tool calls per session
- Max 10 tool calls per iteration
- Stop after 3 consecutive errors and request context rotation
- For payment APIs (Stripe, etc.): always use test mode when debugging
- When context exceeds 80% capacity: re-inject GUARDRAILS.md + summary + objective, then reset context

## Reason
Agent debugging Stripe entered an infinite loop of test calls, resulting in 2000+ requests in 30 minutes, $200 API costs, and account suspension.

## Provenance
Manual addition, based on guardrails.md case study.
