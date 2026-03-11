---
name: no-new-deps-without-approval
description: Do not add new npm, pip, or other package dependencies without explicit human approval. Apply when installing packages, adding imports, or suggesting new libraries.
scope: project
severity: warning
triggers:
  - "Installing packages"
  - "Adding dependencies"
  - "npm install"
  - "pip install"
  - "New library"
  - "Use package X"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No New Dependencies Without Approval

## Trigger
Adding a new package to package.json, requirements.txt, pyproject.toml, Cargo.toml, or any dependency manifest.

## Instruction
- Before running `npm install <pkg>`, `pip install <pkg>`, or equivalent: list the package and why it's needed, then ask for approval
- Prefer using existing project dependencies over adding new ones
- If a built-in or stdlib solution exists, use it instead of a new dependency
- When suggesting a new dependency: include package name, purpose, and alternative (e.g. "or we could use the built-in X")
- Never add dependencies "to fix" a problem without confirming the user wants new packages in the project

## Reason
Uncontrolled dependency growth leads to security risk, bundle bloat, and maintenance burden. Teams want to review what gets added to their lockfile.

## Provenance
Manual addition, common team preference for dependency hygiene.
