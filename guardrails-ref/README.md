# guardrails-ref

[![npm version](https://img.shields.io/npm/v/guardrails-ref.svg)](https://www.npmjs.com/package/guardrails-ref)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)

CLI for [Agent Guardrails](https://github.com/9atar6/agent-guardrails) — init, add, remove, setup, validate, and list GUARDRAIL.md files.

## Why?

AI coding agents (Cursor, Claude Code, etc.) don't remember across sessions. Guardrails give them persistent constraints: "never do this." Write rules once, they apply every chat.

## Quick start

```bash
npx guardrails-ref init
```

Creates `.agents/guardrails/`, adds the `no-plaintext-secrets` example, and configures Cursor and Claude Code to read your guardrails. No global install needed.

> **Note:** IDEs don't yet recognize guardrails natively. The `setup` command adds a rule so the AI reads them. Once IDEs add support, this won't be needed.

## Commands

| Command | Description |
|---------|-------------|
| `npx guardrails-ref init [path]` | Create `.agents/guardrails/`, add no-plaintext-secrets, configure Cursor and Claude Code |
| `npx guardrails-ref add <name> [path]` | Add an example guardrail (name required, e.g. no-destructive-commands) |
| `npx guardrails-ref remove <name> [path]` | Remove a guardrail (name required) |
| `npx guardrails-ref setup [path]` | Add the guardrail rule to Cursor rules and Claude instructions (use `--remove` to undo) |
| `npx guardrails-ref validate [path]` | Validate GUARDRAIL.md files (use `--json` for JSON, `--strict` to fail on warnings) |
| `npx guardrails-ref check [path]` | Validate with minimal output (CI-friendly, use `--strict` to fail on warnings) |
| `npx guardrails-ref upgrade [path]` | Update installed guardrails to latest templates (use `--dry-run` to preview) |
| `npx guardrails-ref list [path]` | List discovered guardrails (use `--json` for JSON output) |

## Supported IDEs

- **Cursor** — via `.cursor/rules/` or `.cursorrules`
- **Claude Code** — via `.claude/instructions.md`

## CI/CD

Use `validate --strict` in GitHub Actions to fail on warnings:

```yaml
- name: Validate guardrails
  run: npx guardrails-ref check . --strict
```

Or with full output or JSON:

```yaml
- name: Validate guardrails
  run: npx guardrails-ref validate . --json
```

## Examples

```bash
npx guardrails-ref init
npx guardrails-ref add no-destructive-commands
npx guardrails-ref add no-new-deps-without-approval
npx guardrails-ref validate .
npx guardrails-ref list .
```

## Available guardrails (add command)

| Name | What it prevents |
|------|------------------|
| `no-plaintext-secrets` | Logging or committing credentials |
| `database-migrations` | Direct schema changes instead of migrations |
| `no-destructive-commands` | rm -rf, DROP TABLE, TRUNCATE without approval |
| `no-new-deps-without-approval` | New packages without approval |
| `no-hardcoded-urls` | Hardcoded API URLs, base URLs, endpoints |
| `no-sudo-commands` | sudo/su/root commands without approval |
| `rate-limiting` | Runaway tool calls and API loops |
| `no-console-in-production` | console.log in production code |
| `require-tests` | Merging code without tests |
| `no-inline-styles` | Inline `style=` in HTML/JSX |
| `no-raw-sql` | Raw SQL without parameterization |
| `no-magic-numbers` | Unexplained numeric literals |

Use `npx guardrails-ref add --list` to see all available guardrails.

## Troubleshooting

- **"Unknown guardrail"** — Run `npx guardrails-ref list .` to see available names
- **Setup not working** — Try `npx guardrails-ref setup --remove` then `npx guardrails-ref setup` again

## Links

- [GitHub](https://github.com/9atar6/agent-guardrails) — Full repo, spec, examples
- [Changelog](https://github.com/9atar6/agent-guardrails/blob/main/CHANGELOG.md) — Version history

## License

MIT — [GitHub](https://github.com/9atar6/agent-guardrails)
