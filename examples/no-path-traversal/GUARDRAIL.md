---
name: no-path-traversal
description: Never use user-controlled paths without validation. Reject paths containing .., absolute paths outside allowed base, or symlinks that escape. Apply when handling file uploads, path params, or config that references files.
scope: project
severity: critical
triggers:
  - "File upload"
  - "File read"
  - "Path parameter"
  - "User-provided path"
  - "fs.readFile"
  - "require(path)"
  - "Config file path"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Path Traversal

## Trigger
Handling file paths from user input, path parameters, file uploads, config that references file paths, or any code that reads or writes files based on user-controlled values.

## Instruction
- Never trust user-provided paths; validate and sanitize before use
- Reject paths containing `..` or that resolve outside an allowed base directory
- Use `path.resolve()` and compare against the base to ensure the resolved path stays within bounds
- Be cautious with symlinks; resolve and validate the real path before allowing access
- Prefer allowlists (e.g. known filenames) over blocklists when possible

## Reason
Path traversal is a common vulnerability when file paths come from user input. Unvalidated paths can expose sensitive files (e.g. .env, config, source code). Agents often skip validation when implementing file handling.

## Provenance
Manual addition, agent-guardrails reference.
