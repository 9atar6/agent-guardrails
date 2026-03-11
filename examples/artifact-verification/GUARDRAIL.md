---
name: artifact-verification
description: Before destructive operations, generate a plan for human review and log actions to an audit trail. Apply when deleting, dropping, truncating, or modifying production.
scope: project
severity: critical
triggers:
  - "Deleting files or directories"
  - "Dropping tables or databases"
  - "Truncating data"
  - "Production modifications"
  - "Schema changes"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
  source: https://guardrails.md/
---

# Artifact Verification

## Trigger
Before any destructive operation: deletes, drops, truncates, or production modifications.

## Instruction
- Generate a `plan.md` (or equivalent) describing all changes, affected paths, and impact
- Present the plan for human approval before executing
- Wait for explicit confirmation before proceeding
- Log all actions to `audit.log` (or project-defined audit trail) with timestamp and scope
- Never skip the plan step even if the user seems to approve verbally — require written confirmation or explicit approval in the plan

## Reason
Agents have executed destructive operations without a reviewable artifact. A plan provides rollback context and ensures humans can verify scope before irreversible changes. Audit logging enables post-incident analysis.

## Provenance
Based on guardrails.md Pattern 1: Artifact verification.
