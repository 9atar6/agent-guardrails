---
name: no-modifying-git-history
description: Never run git push --force, destructive rebase, or history-rewriting commands without explicit human approval. Apply when suggesting git commands that modify shared history.
scope: project
severity: critical
triggers:
  - "git push"
  - "git rebase"
  - "Force push"
  - "Rewriting history"
  - "git reset"
  - "Amending commits"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Modifying Git History

## Trigger
Suggesting or running git commands that modify history: force push, rebase that rewrites commits, reset, or amending pushed commits.

## Instruction
- Never run `git push --force`, `git push -f`, or `git push --force-with-lease` without explicit human approval
- Never run `git rebase` on branches that may have been pushed or shared without approval
- Never run `git reset --hard` to undo commits that others may have pulled
- When the user asks to "fix" history or "undo" pushed commits: explain the impact and wait for confirmation
- For shared branches (main, develop): always warn that force push can overwrite others' work
- Prefer `git revert` over history-rewriting when undoing commits on shared branches

## Reason
Agents have suggested force push and rebase that overwrote shared history, causing lost work and broken clones. History-rewriting on shared branches requires explicit human confirmation.

## Provenance
Manual addition, common failure mode in autonomous coding agents.
