/**
 * Bundled example guardrails. Used by init and add commands.
 */
export const TEMPLATES: Record<string, string> = {
  "no-plaintext-secrets": `---
name: no-plaintext-secrets
description: Never log, commit, or expose API keys, passwords, or tokens. Use environment variables or secrets managers. Apply when adding logging, implementing auth, or integrating third-party APIs.
scope: project
severity: critical
triggers:
  - "Adding logging"
  - "Implementing authentication"
  - "API integration"
  - "Handling credentials"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Plaintext Secrets

## Trigger
Implementing authentication endpoints, adding logging, integrating third-party APIs, or handling any user credentials or API keys.

## Instruction
- Never store, log, or commit plaintext credentials (API keys, passwords, tokens, sessions)
- Always use environment variables or secrets managers (e.g. 1Password, Vault)
- Use bcrypt with 12 salt rounds for password hashing
- Always require HTTPS for authentication endpoints
- Use a \`redactSensitive()\` helper when logging objects that may contain secrets

## Reason
API keys were exposed in git during a 2025 security audit. Plaintext credentials in logs led to emergency key rotation.
`,

  "database-migrations": `---
name: database-migrations
description: Always use migration files for schema changes. Never modify production schema directly. Apply when modifying database schema, adding tables, or changing columns.
scope: project
severity: critical
triggers:
  - "Modifying database schema"
  - "Adding or changing tables"
  - "Database migrations"
  - "Prisma schema"
  - "SQL migrations"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Database Migrations

## Trigger
Modifying database schema, adding tables, changing columns, or optimizing queries that affect schema.

## Instruction
- Always create a migration file (e.g. \`prisma migrate dev\`, \`rails db:migrate\`, or equivalent)
- Never modify production schema directly without a migration
- Test migrations in staging before applying to production
- Require explicit human approval before running migrations in production

## Reason
Direct schema changes caused 4-hour downtime and data inconsistencies. Migrations provide rollback capability and audit trail.
`,

  "no-destructive-commands": `---
name: no-destructive-commands
description: Never run destructive shell commands or SQL without explicit human approval. Apply when deleting files, dropping tables, truncating data, or modifying production.
scope: project
severity: critical
triggers:
  - "Deleting files"
  - "Cleaning up"
  - "Dropping tables"
  - "Truncating data"
  - "Database cleanup"
  - "rm -rf"
  - "DROP TABLE"
  - "TRUNCATE"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Destructive Commands

## Trigger
Running shell commands that delete files, database commands that drop or truncate data, or any operation that irreversibly removes content.

## Instruction
- Never run \`rm -rf\`, \`rm -r\`, or recursive deletes without explicit human approval
- Never run \`DROP TABLE\`, \`DROP DATABASE\`, \`TRUNCATE\`, or \`DELETE\` without a WHERE clause on production data without explicit approval
- For cleanup tasks: propose the command, explain the impact, and wait for confirmation before executing
- Prefer moving to trash or using \`--dry-run\` when available
- If the user asks to "delete everything" or "clean slate": stop and confirm scope before proceeding

## Reason
Agents have run \`rm -rf\` on wrong directories and \`DROP TABLE\` in production. Destructive operations must never execute without explicit human confirmation.
`,

  "no-new-deps-without-approval": `---
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
- Before running \`npm install <pkg>\`, \`pip install <pkg>\`, or equivalent: list the package and why it's needed, then ask for approval
- Prefer using existing project dependencies over adding new ones
- If a built-in or stdlib solution exists, use it instead of a new dependency
- When suggesting a new dependency: include package name, purpose, and alternative (e.g. "or we could use the built-in X")
- Never add dependencies "to fix" a problem without confirming the user wants new packages in the project

## Reason
Uncontrolled dependency growth leads to security risk, bundle bloat, and maintenance burden. Teams want to review what gets added to their lockfile.
`,

  "rate-limiting": `---
name: rate-limiting
description: Limit tool calls and API requests to prevent runaway loops. Max 50 tool calls per session, max 10 per iteration. Stop after 3 consecutive errors.
scope: session
severity: warning
triggers:
  - "Debugging API integrations"
  - "Stripe or payment API calls"
  - "External API calls in loops"
  - "Context window approaching capacity"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Rate Limiting

## Trigger
Debugging API integrations, making repeated external API calls, or when context exceeds 80% capacity or 10+ consecutive errors.

## Instruction
- Max 50 tool calls per session
- Max 10 tool calls per iteration
- Stop after 3 consecutive errors and request context rotation
- For payment APIs (Stripe, etc.): always use test mode when debugging
- When context exceeds 80% capacity: re-inject GUARDRAILS.md + summary + objective, then reset context

## Reason
Agent debugging Stripe entered an infinite loop of test calls, resulting in 2000+ requests in 30 minutes, $200 API costs, and account suspension.
`,

  "no-console-in-production": `---
name: no-console-in-production
description: Never add console.log, console.debug, or console.info in production code. Use a proper logging library. Apply when adding debugging, logging, or trace statements.
scope: project
severity: warning
triggers:
  - "Adding logging"
  - "Debugging"
  - "console.log"
  - "console.debug"
  - "Trace statements"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Console in Production

## Trigger
Adding logging, debugging statements, or trace output to application code that ships to production.

## Instruction
- Never add \`console.log\`, \`console.debug\`, or \`console.info\` in production code paths
- Use a structured logging library (e.g. pino, winston, log4j) with log levels
- For temporary debugging: use \`console.warn\` or \`console.error\` and add a TODO to remove before merge
- Strip or gate console calls in production builds when a logger is not available
- Prefer environment-based log levels (e.g. DEBUG=true) over hardcoded console statements

## Reason
console.log in production leaks sensitive data, clutters logs, and impacts performance. Structured loggers support levels, formatting, and safe redaction.
`,
};

export const TEMPLATE_NAMES = Object.keys(TEMPLATES);
