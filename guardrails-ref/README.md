# guardrails-ref

CLI for [Agent Guardrails](https://github.com/9atar6/agent-guardrails) — init, add, remove, setup, validate, and list GUARDRAIL.md files.

## Install

```bash
npx guardrails-ref init
```

No global install needed. Or: `npm install -g guardrails-ref`

## Commands

| Command | Description |
|---------|-------------|
| `npx guardrails-ref init [path]` | Create `.agents/guardrails/`, add no-plaintext-secrets, configure Cursor and Claude Code |
| `npx guardrails-ref add <name> [path]` | Add an example guardrail (e.g. no-destructive-commands, database-migrations) |
| `npx guardrails-ref remove <name> [path]` | Remove a guardrail from .agents/guardrails/ |
| `npx guardrails-ref setup [path]` | Add the guardrail rule to Cursor rules and Claude instructions (use `--remove` to undo) |
| `npx guardrails-ref validate [path]` | Validate GUARDRAIL.md files (use `--json` for JSON, `--strict` to fail on warnings) |
| `npx guardrails-ref list [path]` | List discovered guardrails (use `--json` for JSON output) |

## Examples

```bash
npx guardrails-ref init
npx guardrails-ref add no-destructive-commands
npx guardrails-ref add no-new-deps-without-approval
npx guardrails-ref validate .
npx guardrails-ref list .
```

## Available guardrails (add command)

- `no-plaintext-secrets` — Never log or commit credentials
- `database-migrations` — Always use migration files
- `no-destructive-commands` — No rm -rf, DROP, TRUNCATE without approval
- `no-new-deps-without-approval` — No new packages without approval
- `no-hardcoded-urls` — No hardcoded API URLs, base URLs, endpoints
- `no-sudo-commands` — No sudo/su/root commands without approval
- `rate-limiting` — Limit tool calls and API loops
- `no-console-in-production` — No console.log in production code

## License

MIT — [GitHub](https://github.com/9atar6/agent-guardrails)
