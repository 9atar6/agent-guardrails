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

This creates `.agents/guardrails/`, adds the `no-plaintext-secrets` example, and configures Cursor, Claude Code, and VS Code Copilot to read your guardrails.

Use `npx guardrails-ref init --minimal` to create `.agents/guardrails/` only (no example, no setup).

> **Note:** IDEs don't yet recognize guardrails natively. The `init` and `setup` commands add a rule so the AI reads your guardrails. Once IDEs add support, this won't be needed.

### Add more guardrails

Add one or several at once:

```bash
npx guardrails-ref add no-destructive-commands no-new-deps-without-approval no-hardcoded-urls
npx guardrails-ref add no-sudo-commands require-tests no-inline-styles
npx guardrails-ref add no-raw-sql no-magic-numbers database-migrations rate-limiting no-console-in-production
```

### Validate and list

```bash
npx guardrails-ref validate .
npx guardrails-ref check .     # Minimal output (CI)
npx guardrails-ref list .
npx guardrails-ref validate . --json   # JSON output for scripting
npx guardrails-ref validate . --strict # Fail on warnings (CI mode)
npx guardrails-ref list . --json      # JSON output for scripting
```

### Remove a guardrail

```bash
npx guardrails-ref remove no-console-in-production
```

### Setup options

```bash
npx guardrails-ref setup --remove      # Undo setup
npx guardrails-ref setup --dry-run     # Preview what would be added/removed
npx guardrails-ref setup --ide auto    # Only configure IDEs that already have config
npx guardrails-ref setup --ide cursor  # Target one IDE: cursor, claude, or copilot
npx guardrails-ref setup --check       # Show which IDEs are configured
```

### Upgrade guardrails

```bash
npx guardrails-ref upgrade              # Update to latest templates
npx guardrails-ref upgrade --dry-run    # Preview changes
npx guardrails-ref upgrade --dry-run --diff  # Preview with diff
```

### Show guardrail content

```bash
npx guardrails-ref why no-destructive-commands   # Show template content
```

### Pre-commit

See `examples/pre-commit/README.md` for pre-commit, Husky, or npm script setup.

## Documentation

| Resource | Description |
|----------|-------------|
| [Tutorial](docs/TUTORIAL.md) | Beginner's guide — what we built, why, how to use it |
| [Specification](spec/specification.md) | Complete format definition |
| [Client Implementation](spec/client-implementation.md) | How IDE vendors add support |
| [Examples](examples/) | 25 reference guardrails |

## Example guardrails

| Name | What it prevents |
|------|------------------|
| `no-plaintext-secrets` | Logging or committing API keys, passwords |
| `no-placeholder-credentials` | Fake or placeholder API keys instead of asking for real values |
| `no-silent-error-handling` | Catching errors without surfacing them to the user |
| `require-access-control` | Exposing sensitive data or admin actions without role checks |
| `database-migrations` | Direct schema changes instead of migrations |
| `no-destructive-commands` | `rm -rf`, `DROP TABLE`, `TRUNCATE` without approval |
| `no-new-deps-without-approval` | Adding packages without human confirmation |
| `no-hardcoded-urls` | Hardcoded API URLs, base URLs, endpoints |
| `no-sudo-commands` | `sudo`, `su`, or root-elevated commands without approval |
| `rate-limiting` | Runaway API loops (e.g. Stripe test mode, max calls) |
| `no-console-in-production` | console.log in production code |
| `require-tests` | Merging code without tests |
| `prefer-existing-code` | Reimplementing when existing code or helpers exist |
| `no-inline-styles` | Inline `style=` in HTML/JSX |
| `no-raw-sql` | Raw SQL without parameterization |
| `no-magic-numbers` | Unexplained numeric literals |
| `no-modifying-git-history` | `git push --force`, destructive rebase without approval |
| `no-deprecated-apis` | Suggesting deprecated or obsolete APIs |
| `no-unsafe-env-assumptions` | Assuming env vars exist without validation |
| `no-hardcoded-user-facing-strings` | Hardcoded labels, messages, errors in UI |

## Development (from source)

If you clone the repo, build the CLI before running validate or list:

```bash
cd guardrails-ref; npm install; npm run build
cd ..
npm run validate
npm run test
```

> **Windows (PowerShell):** Use `;` instead of `&&` to chain commands.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup.

## Project structure

```
agent-guardrails/
├── spec/                    # Specification and client guide
├── guardrails-ref/          # CLI (init, add, remove, setup, validate, check, upgrade, list, why)
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
