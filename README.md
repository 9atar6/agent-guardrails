# Agent Guardrails

A simple, open format for defining constraints — what AI coding agents must NOT do — complementing [Agent Skills](https://agentskills.io) which define capabilities.

[![npm version](https://img.shields.io/npm/v/guardrails-ref.svg)](https://www.npmjs.com/package/guardrails-ref)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why Agent Guardrails?

AI coding agents (Cursor, Claude Code, VS Code Copilot, etc.) are increasingly capable, but they don't remember across sessions. Without persistent constraints, agents repeat the same mistakes: logging secrets, running destructive commands, adding dependencies without approval.

Guardrails solve this by giving agents a **file-based protocol** they read at session start. Write constraints once, they apply every chat.

- **For developers:** Define "never do this" rules that persist in your project
- **For teams:** Share safety rules via version control
- **For IDE vendors:** A spec to implement native support (like Agent Skills)

## What can guardrails prevent?

- **Secret leaks** — Never log or commit API keys, passwords, tokens
- **Destructive commands** — No `rm -rf`, `DROP TABLE`, `TRUNCATE` without explicit approval
- **Schema drift** — Always use migration files, never modify production directly
- **Dependency creep** — No new npm/pip packages without human approval
- **Runaway loops** — Limit tool calls and API requests per session

## Getting started

### One command

From your project directory:

```bash
npx guardrails-ref init
```

This creates `.agents/guardrails/`, adds the `no-plaintext-secrets` example, and configures Cursor and Claude Code to read your guardrails.

> **Note:** IDEs don't yet recognize guardrails natively. The `init` and `setup` commands add a rule so the AI reads your guardrails. Once IDEs add support, this won't be needed.

### Add more guardrails

```bash
npx guardrails-ref add no-destructive-commands
npx guardrails-ref add no-new-deps-without-approval
npx guardrails-ref add database-migrations
npx guardrails-ref add rate-limiting
```

### Validate

```bash
npx guardrails-ref validate .
npx guardrails-ref list .
```

## Documentation

| Resource | Description |
|----------|-------------|
| [Tutorial](docs/TUTORIAL.md) | Beginner's guide — what we built, why, how to use it |
| [Specification](spec/specification.md) | Complete format definition |
| [Client Implementation](spec/client-implementation.md) | How IDE vendors add support |
| [Examples](examples/) | 5 reference guardrails |

## Example guardrails

| Name | What it prevents |
|------|------------------|
| `no-plaintext-secrets` | Logging or committing API keys, passwords |
| `database-migrations` | Direct schema changes instead of migrations |
| `no-destructive-commands` | `rm -rf`, `DROP TABLE`, `TRUNCATE` without approval |
| `no-new-deps-without-approval` | Adding packages without human confirmation |
| `rate-limiting` | Runaway API loops (e.g. Stripe test mode, max calls) |

## Development (from source)

If you clone the repo, build the CLI before running validate or list:

```bash
cd guardrails-ref && npm install && npm run build
cd ..
npm run validate
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup.

## Project structure

```
agent-guardrails/
├── spec/                    # Specification and client guide
├── guardrails-ref/          # CLI (validate, init, setup, add)
├── examples/                # Reference guardrails
├── docs/                    # Tutorial
└── LICENSE
```

## Relationship to guardrails.md

This spec formalizes the [guardrails.md](https://guardrails.md/) protocol:

- **Signs pattern** — Trigger, Instruction, Reason (preserved in body)
- **YAML frontmatter** — Machine parsing and discovery
- **Directory convention** — `.agents/guardrails/` for cross-IDE interoperability

## Open development

Agent Guardrails is an open format. The specification and validator are open to contributions.

- [Contributing](CONTRIBUTING.md) — How to add guardrails, improve the spec, or contribute to the CLI
- [Changelog](CHANGELOG.md) — Version history

## License

MIT — see [LICENSE](LICENSE).
