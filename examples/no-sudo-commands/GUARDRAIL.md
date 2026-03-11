---
name: no-sudo-commands
description: Never run sudo, su, or root-elevated commands without explicit human approval. Apply when suggesting shell commands that modify system files or require elevated privileges.
scope: project
severity: critical
triggers:
  - "Installing system packages"
  - "apt install"
  - "yum install"
  - "brew install"
  - "Modifying system files"
  - "sudo"
  - "su "
  - "root"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Sudo Commands

## Trigger
Suggesting or running shell commands that require elevated privileges (sudo, su, root) or that modify system-wide files.

## Instruction
- Never run `sudo`, `su`, or root-elevated commands without explicit human approval
- For package installation: prefer user-space tools (nvm, pyenv, user-local npm) over system-wide installs
- If system packages are needed: propose the command, explain the impact, and wait for confirmation
- Never modify /etc, /usr (outside user installs), or other system directories without approval
- When the user asks to "install" something: clarify scope (project vs system) before suggesting commands

## Reason
Agents have run sudo commands that overwrote system configs or installed conflicting packages. Elevated privileges require explicit human confirmation.
