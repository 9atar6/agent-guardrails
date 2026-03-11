---
name: require-access-control
description: When handling sensitive data or admin actions, enforce role or permission checks. Never assume the current user has access. Apply when adding auth, admin features, or user-specific data.
scope: project
severity: critical
triggers:
  - "Admin features"
  - "User data"
  - "Sensitive data"
  - "Authorization"
  - "Permissions"
  - "Role check"
  - "Private data"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require Access Control

## Trigger
Adding admin features, handling user-specific or sensitive data, implementing authorization, or any code that differentiates between user roles or permissions.

## Instruction
- Never assume the current user has access to sensitive data or admin actions
- Add explicit role or permission checks before exposing or modifying sensitive data
- For admin-only actions: verify the user has admin role or equivalent permission
- For user-specific data: verify the requester is the owner or has explicit access
- When adding new endpoints or UI: consider who should access them and add checks accordingly
- Avoid hardcoding "admin" or "user" assumptions; use the project's auth/permission system

## Reason
Agents sometimes add features without access checks, exposing admin actions or private data to regular users. Access control must be explicit and enforced.

## Provenance
Manual addition, security best practice.
