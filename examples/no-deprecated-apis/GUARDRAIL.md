---
name: no-deprecated-apis
description: Never suggest deprecated or obsolete APIs. Check package docs and current best practices before recommending patterns. Apply when adding dependencies, using libraries, or implementing features.
scope: project
severity: warning
triggers:
  - "Adding dependencies"
  - "Using library"
  - "API usage"
  - "Implementing feature"
  - "Package documentation"
  - "Deprecated"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Deprecated APIs

## Trigger
Adding dependencies, using libraries, implementing features, or recommending APIs or patterns.

## Instruction
- Never suggest deprecated or obsolete APIs; check the package's current documentation first
- When a pattern might be deprecated: verify against the latest docs before recommending
- Prefer current, maintained approaches over legacy patterns (e.g. fetch over XMLHttpRequest, modern Node APIs over legacy callbacks)
- If the project uses a specific version: ensure recommendations match that version's API
- When unsure about deprecation status: note the uncertainty and suggest verifying in docs

## Reason
Agents often suggest outdated patterns from training data. Deprecated APIs may be removed in future versions and can cause technical debt. Current docs are the source of truth.

## Provenance
Manual addition, agent-guardrails reference.
