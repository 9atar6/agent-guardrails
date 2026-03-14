---
name: no-pii-in-output
description: Never output or log unredacted personally identifiable information (PII). Redact or omit SSN, credit card numbers, full names, emails, and similar data unless strictly required and authorized. Apply when logging, building API responses, or generating reports that may contain user data.
scope: project
severity: critical
triggers:
  - "Adding or modifying logging"
  - "Building API responses with user data"
  - "Generating reports or exports"
  - "Handling form data or user profiles"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No PII in Output

## Trigger
Logging, API responses, reports, or any code path that might emit or persist data that could identify a natural person (names, emails, SSN, payment data, health identifiers, etc.).

## Instruction
- Never log, return, or persist full PII (SSN, credit card numbers, full names, email addresses, phone numbers, health IDs) in plaintext.
- Use redaction (e.g. last-4 only, hashing, or placeholders) when PII must appear in logs or non-production outputs for debugging.
- In API responses, return only the minimum PII necessary for the use case and only when the caller is authorized.
- When generating reports or exports, apply the same redaction rules and document what is included.
- Prefer structured logging with redacted or tokenized fields rather than interpolating raw user data into messages.

## Reason
Unredacted PII in logs and outputs drives compliance failures (GDPR, CCPA, HIPAA) and increases breach impact. Many incidents stem from PII in logs, error messages, or API responses.

## Provenance
Manual addition, based on common PII leak and compliance case studies.
