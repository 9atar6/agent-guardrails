# Specification

> The complete format specification for Agent Guardrails.

## Overview

Agent Guardrails complement [Agent Skills](https://agentskills.io/specification) by defining **constraints** — what agents must NOT do — while skills define **capabilities** — what agents can do. Guardrails are loaded at session start so constraints are active from the beginning.

## Directory structure

A guardrail is either:

1. A directory containing a `GUARDRAIL.md` file (for modular guardrails)
2. A single `GUARDRAILS.md` file at project root (for consolidated constraints)

```
guardrail-name/
├── GUARDRAIL.md          # Required: metadata + constraint instructions
└── ...                   # Optional: references, assets

# Or at project root:
GUARDRAILS.md             # Single file with multiple Signs
```

## Where guardrails live

| Scope | Path | Purpose |
|-------|------|---------|
| Project | `./.agents/guardrails/` | Cross-client interoperability |
| Project | `./GUARDRAILS.md` | Single-file at root |
| User | `~/.agents/guardrails/` | User-level constraints |

The `.agents/guardrails/` paths are the cross-client convention. Scanning these directories means guardrails are visible across Cursor, VS Code, Claude Code, and other compliant agents.

## GUARDRAIL.md format

The `GUARDRAIL.md` file must contain YAML frontmatter followed by Markdown content.

### Frontmatter

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen. |
| `description` | Yes | Max 1024 characters. Non-empty. Describes what is forbidden and when this constraint applies. |
| `scope` | No | One of: `global`, `project`, `session`. Default: `project`. |
| `severity` | No | One of: `critical`, `warning`, `advisory`. Default: `warning`. |
| `triggers` | No | List of context strings that activate this guardrail (e.g. "Adding logging", "Database schema changes"). |
| `license` | No | License name or reference to a bundled license file. |
| `metadata` | No | Arbitrary key-value mapping for additional metadata. |

Minimal example:

```markdown
---
name: no-plaintext-secrets
description: Never log, commit, or expose API keys, passwords, or tokens. Use redaction helpers.
---
```

Example with optional fields:

```markdown
---
name: database-migrations
description: Always use migration files for schema changes. Never modify production schema directly.
scope: project
severity: critical
triggers:
  - "Modifying database schema"
  - "Adding or changing tables"
  - "Database migrations"
license: MIT
metadata:
  author: example-org
  version: "1.0"
---
```

### name field

The required `name` field:

- Must match the parent directory name when in a directory (e.g. `no-plaintext-secrets/GUARDRAIL.md` → `name: no-plaintext-secrets`)
- Must not contain consecutive hyphens (`--`)
- Must not start or end with a hyphen (`-`)
- May only contain unicode lowercase alphanumeric characters (`a-z`, `0-9`) and hyphens (`-`)
- Must be 1-64 characters

Valid examples:

```yaml
name: no-plaintext-secrets
```

```yaml
name: database-migrations
```

Invalid examples:

```yaml
name: NoPlaintextSecrets  # uppercase not allowed
```

```yaml
name: -no-secrets  # cannot start with hyphen
```

```yaml
name: no--secrets  # consecutive hyphens not allowed
```

### description field

The required `description` field:

- Should include specific keywords that help agents identify when this constraint applies
- Should describe both what is forbidden and when this guardrail applies
- Must be 1-1024 characters

Good example:

```yaml
description: Never log, commit, or expose API keys, passwords, or tokens. Use environment variables or secrets managers. Apply when adding logging, implementing auth, or integrating third-party APIs.
```

Poor example:

```yaml
description: Don't leak secrets.
```

### scope field

The optional `scope` field:

- `global`: Applies across all projects for the user
- `project`: Applies only within the current project
- `session`: Applies only for the current session

### severity field

The optional `severity` field:

- `critical`: Must never be violated. Agent should stop and request human approval.

- `warning`: Should not be violated. Agent may proceed but should log or surface the concern.

- `advisory`: Best practice. Agent may proceed but should consider the guidance.

### triggers field

The optional `triggers` field is a list of context strings. When the agent's current task matches one of these triggers, the guardrail is especially relevant. Examples:

```yaml
triggers:
  - "Adding logging"
  - "Implementing authentication"
  - "Database schema changes"
  - "API integration"
```

### Body content

The Markdown body after the frontmatter contains the constraint instructions. The recommended structure follows the [Signs pattern](https://guardrails.md/) from guardrails.md:

- **Trigger**: Context that precedes the error (when this guardrail applies)
- **Instruction**: Deterministic command to prevent the error (what the agent must do or must NOT do)
- **Reason**: Why this guardrail exists

Example:

```markdown
---
name: no-plaintext-secrets
description: Never log, commit, or expose API keys, passwords, or tokens.
---

# No Plaintext Secrets

## Trigger
Implementing authentication endpoints, adding logging, or integrating third-party APIs.

## Instruction
- Never store, log, or commit plaintext credentials
- Always use environment variables or secrets managers
- Use bcrypt with 12 salt rounds for passwords
- Always require HTTPS for auth endpoints

## Reason
Plaintext passwords were exposed in a 2025 security audit.
```

## Loading model

Guardrails use a simpler loading model than skills because constraints must be active from session start:

| Tier | What's loaded | When | Token cost |
|------|---------------|------|------------|
| 1. Catalog | Name + description | Session start | ~50-100 tokens per guardrail |
| 2. Full content | Complete GUARDRAIL.md body | Session start | ~200-500 tokens each |

Unlike skills (which load on task match), guardrails are loaded at initialization so the agent never operates without constraint awareness.

## Precedence

When multiple guardrails share the same `name`:

- Project-level guardrails override user-level guardrails
- Within the same scope, prefer the most recently discovered or last-found

## Validation

Use the guardrails-ref validator to check GUARDRAIL.md files:

```bash
npx guardrails-ref validate ./my-guardrail
npx guardrails-ref validate ./.agents/guardrails/
```

This checks that the frontmatter is valid and follows all naming conventions.

## License

This specification is released under the [MIT License](../LICENSE). The format is open for adoption and contribution.
