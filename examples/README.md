# Example Guardrails

Reference guardrails you can add with `npx guardrails-ref add <name>`. Use `npx guardrails-ref why <name>` to show a guardrail's full content.

| Name | What it prevents |
|------|------------------|
| `no-plaintext-secrets` | Logging or committing API keys, passwords, tokens |
| `no-placeholder-credentials` | Fake or placeholder API keys instead of asking for real values |
| `no-silent-error-handling` | Catching errors without surfacing them to the user |
| `require-access-control` | Exposing sensitive data or admin actions without role checks |
| `database-migrations` | Direct schema changes instead of migrations |
| `no-destructive-commands` | `rm -rf`, `DROP TABLE`, `TRUNCATE` without approval |
| `no-new-deps-without-approval` | New packages without human confirmation |
| `no-hardcoded-urls` | Hardcoded API URLs, base URLs, endpoints |
| `no-sudo-commands` | `sudo`, `su`, or root commands without approval |
| `rate-limiting` | Runaway tool calls and API loops |
| `no-console-in-production` | `console.log` in production code |
| `require-tests` | Merging code without tests |
| `prefer-existing-code` | Reimplementing when existing code or helpers exist |
| `no-inline-styles` | Inline `style=` in HTML/JSX |
| `no-raw-sql` | Raw SQL without parameterization |
| `no-magic-numbers` | Unexplained numeric literals |
| `no-modifying-git-history` | `git push --force`, destructive rebase without approval |
| `no-deprecated-apis` | Suggesting deprecated or obsolete APIs |
| `no-unsafe-env-assumptions` | Assuming env vars exist without validation |
| `no-hardcoded-user-facing-strings` | Hardcoded labels, messages, errors in UI |

Each example lives in its own directory with a `GUARDRAIL.md` file. See `pre-commit/README.md` for pre-commit, Husky, or npm script setup. See the [specification](../spec/specification.md) for the format.
