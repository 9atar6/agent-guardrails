---
name: context-rotation
description: When context exceeds 80% capacity or 10+ consecutive errors, save state, summarize, and reset to prevent "The Gutter" — agents repeating mistakes in polluted context.
scope: session
severity: warning
triggers:
  - "Context window approaching capacity"
  - "Repeated identical errors"
  - "Circular tool call loops"
  - "10+ consecutive failures"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
  source: https://guardrails.md/
---

# Context Rotation

## Trigger
Context exceeds 80% capacity, 10+ consecutive errors, repeated identical failures, or circular tool call loops.

## Instruction
- Save current state to `context-snapshot.md` (or equivalent) before resetting
- Summarize key learnings and what was attempted
- Reset the context window
- Re-inject: GUARDRAILS.md + summary + original objective
- Do not continue in polluted context — rotation prevents recursive failure loops

## Reason
Agents feed outputs back into context. When it fills with error logs and failed attempts, the agent prioritizes recent failures over original instructions and enters "The Gutter" — repeating the same mistakes indefinitely. Rotation breaks the loop.

## Provenance
Based on guardrails.md Pattern 2: Context rotation.
