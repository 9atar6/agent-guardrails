---
name: no-client-only-access-control
description: Never enforce authorization only in the client. Every permission check that gates sensitive data or actions must have a matching server-side check. Apply when adding role-based UI, admin features, or feature flags that control access.
scope: project
severity: critical
triggers:
  - "Admin or privileged UI"
  - "Role-based visibility"
  - "Feature flags or permissions in UI"
  - "Hiding buttons or routes by role"
  - "LocalStorage or client state for auth"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Client-Only Access Control

## Trigger
Adding UI or logic that shows or hides features, data, or actions based on user role, permission, or any client-held authorization state.

## Instruction
- Never rely on the client alone to enforce who can see or do something. The server must verify permissions for every sensitive request.
- Do not store authorization decisions (e.g. "isAdmin", "canDelete") only in localStorage, cookies, or client state and then trust them in API calls. The backend must re-validate roles/permissions per request.
- When adding "admin only" or "premium only" UI: implement the same check on the server for the corresponding API or action; treat client checks as UX only (hiding UI), not as security.
- Do not send role or permission flags from the client and have the server trust them without looking up the actual user and their permissions.
- When in doubt: assume the client is hostile; the server must independently decide access.

## Reason
Client-side access control is trivially bypassed (dev tools, modified requests, forged tokens). Applications that enforce "who can do what" only in the browser have led to privilege escalation and data exposure. Authorization must be enforced on the server for every sensitive operation.

## Provenance
Manual addition, based on OWASP Broken Access Control and client-side authorization antipatterns.
