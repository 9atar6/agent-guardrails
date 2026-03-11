---
name: require-commit-approval
description: Never run git commit or git push without explicit user approval. Show diff, wait for confirmation before committing.
scope: project
severity: critical
triggers:
  - "Committing changes"
  - "git commit"
  - "git push"
  - "Pushing to remote"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Commit Approval

## Trigger
About to run `git commit`, `git push`, or any operation that persists changes to version control.

## Instruction
- Never run `git commit` or `git push` without explicit user approval
- Show the diff (or summary of changes) and ask for confirmation before committing
- Wait for the user to confirm (e.g. "yes", "commit", "push") before executing
- If the user says "commit my changes" or similar, still show what will be committed and get explicit approval
- Prefer `git add` + show status, then wait — do not auto-commit

## Reason
Agents have committed incomplete work, wrong files, or broken code without the user reviewing. Unapproved commits pollute history and can push secrets or bugs to remotes.

## Provenance
Common failure mode in autonomous coding agents.
