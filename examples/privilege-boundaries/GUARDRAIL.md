---
name: privilege-boundaries
description: Define what paths and resources the agent can read or write. Never touch node_modules, .git, or production config without explicit approval.
scope: project
severity: critical
triggers:
  - "File system operations"
  - "Reading or writing files"
  - "Modifying config"
  - "Accessing dependencies"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
  source: https://guardrails.md/
---

# Privilege Boundaries

## Trigger
Any file system read/write, config modification, or access to project directories.

## Instruction
- **Forbidden (never touch without explicit approval):** `node_modules/`, `.git/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `.env`, `.env.*`, production config files
- **Read-only unless instructed:** Database migrations, CI config (`.github/`, `.gitlab-ci.yml`), deployment config
- **Allowed for normal edits:** Source code (`src/`, `lib/`), tests (`test/`, `__tests__/`), docs, project config files
- When in doubt, ask before modifying files outside the current task scope
- If the user requests changes to forbidden paths, stop and confirm scope before proceeding

## Reason
Agents have corrupted `node_modules`, overwritten lockfiles, and exposed secrets by modifying `.env`. Explicit boundaries prevent accidental damage to dependency state and version control.

## Provenance
Based on guardrails.md Pattern 3: Privilege boundaries.
