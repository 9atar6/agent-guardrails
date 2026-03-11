---
name: no-destructive-commands
description: Never run destructive shell commands or SQL without explicit human approval. Apply when deleting files, dropping tables, truncating data, or modifying production.
scope: project
severity: critical
triggers:
  - "Deleting files"
  - "Cleaning up"
  - "Dropping tables"
  - "Truncating data"
  - "Database cleanup"
  - "rm -rf"
  - "DROP TABLE"
  - "TRUNCATE"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Destructive Commands

## Trigger
Running shell commands that delete files, database commands that drop or truncate data, or any operation that irreversibly removes content.

## Instruction
- Never run `rm -rf`, `rm -r`, or recursive deletes without explicit human approval
- Never run `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, or `DELETE` without a WHERE clause on production data without explicit approval
- For cleanup tasks: propose the command, explain the impact, and wait for confirmation before executing
- Prefer moving to trash or using `--dry-run` when available
- If the user asks to "delete everything" or "clean slate": stop and confirm scope before proceeding

## Reason
Agents have run `rm -rf` on wrong directories and `DROP TABLE` in production. Destructive operations must never execute without explicit human confirmation.

## Provenance
Manual addition, common failure mode in autonomous coding agents.
