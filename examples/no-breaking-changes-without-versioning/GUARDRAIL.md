---
name: no-breaking-changes-without-versioning
description: Never introduce breaking changes to public APIs without a semver major bump, deprecation notice, or migration path. Apply when changing function signatures, removing exports, or altering response shapes.
scope: project
severity: critical
triggers:
  - "Changing API"
  - "Removing export"
  - "Function signature"
  - "Breaking change"
  - "Rename public"
  - "Response shape"
  - "Library"
  - "Package"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Breaking Changes Without Versioning

## Trigger
Changing public APIs, function signatures, removing exports, renaming public symbols, altering response shapes, or any change that could break existing consumers.

## Instruction
- Before breaking changes: bump semver major (e.g. 1.2.3 → 2.0.0) or provide a clear migration path
- Deprecate before removing: add deprecation notices and keep old behavior for at least one minor release
- Document migration steps in CHANGELOG or migration guide
- For libraries: consider backward-compatible alternatives (e.g. overloads, optional params) before breaking
- Never remove or rename public exports without explicit user approval and versioning

## Reason
Breaking changes without versioning or migration paths break consumers silently. Libraries and services need clear upgrade paths. Semver and deprecation notices are standard practice and should be enforced.

## Provenance
Manual addition, agent-guardrails reference.
