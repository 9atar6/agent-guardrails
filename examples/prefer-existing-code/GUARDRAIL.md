---
name: prefer-existing-code
description: Prefer existing code and shared helpers over reimplementing. Search the codebase before adding new logic. Apply when adding features, refactoring, or implementing functionality.
scope: project
severity: warning
triggers:
  - "Adding features"
  - "Implementing"
  - "Refactoring"
  - "New function"
  - "Helper"
  - "Utility"
  - "Duplicate"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Prefer Existing Code

## Trigger
Adding features, implementing functionality, refactoring, or writing new helpers and utilities.

## Instruction
- Before implementing: search the codebase for existing functions, utilities, or patterns that already do what you need
- Prefer reusing existing code over copy-pasting or reimplementing
- When adding shared logic: extract to a common module or helper instead of duplicating
- If similar code exists elsewhere: refactor to use a shared implementation
- When the user asks for something that may already exist: check first and suggest the existing solution if applicable

## Reason
Agents often reimplement logic that already exists, leading to duplication, inconsistency, and maintenance burden. Reusing existing code reduces bugs and keeps the codebase coherent.

## Provenance
Manual addition, common failure mode in autonomous coding agents (DAPLab).
