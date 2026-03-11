---
name: no-hardcoded-urls
description: Never hardcode API URLs, base URLs, or endpoints. Use environment variables or config. Apply when adding API calls, integrations, or external service URLs.
scope: project
severity: warning
triggers:
  - "API integration"
  - "Adding API calls"
  - "Base URL"
  - "Endpoint"
  - "http://"
  - "https://"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Hardcoded URLs

## Trigger
Adding API calls, integrating external services, or referencing URLs (base URLs, endpoints, webhook URLs) in code.

## Instruction
- Never hardcode API base URLs, endpoints, or webhook URLs in source code
- Use environment variables (e.g. `API_BASE_URL`, `WEBHOOK_URL`) or config files
- Document required env vars in README or .env.example
- For tests: use localhost, mock servers, or env-based URLs
- Prefer relative paths for same-origin requests when applicable

## Reason
Hardcoded URLs break across environments (dev/staging/prod), leak internal endpoints, and block easy configuration. Environment-based config is standard practice.
