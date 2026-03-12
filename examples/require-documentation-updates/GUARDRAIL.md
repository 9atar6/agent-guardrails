---
name: require-documentation-updates
description: When changing behavior, config, or public APIs, update README, API docs, or CHANGELOG. Never leave docs out of sync with code. Apply when changing env vars, CLI flags, config, or public behavior.
scope: project
severity: warning
triggers:
  - "Changing config"
  - "Environment variables"
  - "CLI flags"
  - "Public API"
  - "README"
  - "Documentation"
  - "New feature"
  - "Behavior change"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Documentation Updates

## Trigger
Changing public behavior, config, environment variables, CLI flags, API contracts, or any change that affects how users or developers interact with the project.

## Instruction
- When adding or changing env vars: update .env.example and README (or equivalent)
- When changing CLI flags or commands: update usage docs and help text
- When changing public APIs: update API docs, JSDoc, or OpenAPI spec
- For notable changes: add a CHANGELOG entry
- Never assume "docs can be updated later"; update them in the same change as the code

## Reason
Agents often change behavior but leave documentation outdated. Stale README, missing env docs, and absent changelog entries cause confusion and wasted time. Keeping docs in sync is low effort and high value.

## Provenance
Manual addition, agent-guardrails reference.
