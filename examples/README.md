# Example Guardrails

Reference guardrails you can add with `npx guardrails-ref add <name>`.

| Name | What it prevents |
|------|------------------|
| `no-plaintext-secrets` | Logging or committing API keys, passwords, tokens |
| `database-migrations` | Direct schema changes instead of migrations |
| `no-destructive-commands` | `rm -rf`, `DROP TABLE`, `TRUNCATE` without approval |
| `no-new-deps-without-approval` | New packages without human confirmation |
| `no-hardcoded-urls` | Hardcoded API URLs, base URLs, endpoints |
| `no-sudo-commands` | `sudo`, `su`, or root commands without approval |
| `rate-limiting` | Runaway tool calls and API loops |
| `no-console-in-production` | `console.log` in production code |

Each example lives in its own directory with a `GUARDRAIL.md` file. See the [specification](../spec/specification.md) for the format.
