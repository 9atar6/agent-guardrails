---
name: require-api-resilience
description: Never add external API calls without timeouts, retries, and error handling. Apply when adding fetch, HTTP clients, or third-party integrations.
scope: project
severity: critical
triggers:
  - "Adding API calls"
  - "fetch"
  - "HTTP client"
  - "Third-party API"
  - "Webhook"
  - "External service"
  - "axios"
  - "Integration"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Require API Resilience

## Trigger
Adding external API calls, HTTP requests, third-party integrations, webhooks, or any code that calls services outside the application.

## Instruction
- Always set a timeout on HTTP requests (e.g. 10–30 seconds); never allow unbounded waits
- Add retry logic with exponential backoff for transient failures (5xx, network errors)
- Handle and surface errors clearly; never swallow API failures silently
- Consider circuit breaker or rate-limit handling for frequently-called APIs
- For critical paths: fail fast with actionable error messages rather than hanging indefinitely

## Reason
Agents often add fetch() or HTTP calls without timeouts or retries. One slow or flaky external API can hang the app or cause cascading failures. Timeouts and retries are cheap to add and prevent many production incidents.

## Provenance
Manual addition, agent-guardrails reference.
