# guardrails-ref

[![npm version](https://img.shields.io/npm/v/guardrails-ref.svg)](https://www.npmjs.com/package/guardrails-ref)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)

CLI for [Agent Guardrails](https://github.com/9atar6/agent-guardrails) — init, add, remove, setup, validate, check, upgrade, diff, list, why, scaffold, and test GUARDRAIL.md files.

## Why?

AI coding agents (Cursor, Claude Code, etc.) don't remember across sessions. Guardrails give them persistent constraints: "never do this." Write rules once, they apply every chat.

## Quick start

```bash
npx guardrails-ref init
```

Creates `.agents/guardrails/`, adds the `no-plaintext-secrets` example, and configures Cursor, Claude Code, VS Code Copilot, Windsurf, Continue, and JetBrains to read your guardrails. No global install needed.

> **Note:** IDEs don't yet recognize guardrails natively. The `setup` command adds a rule so the AI reads them. Once IDEs add support, this won't be needed.

**User-level guardrails:** Use `--user` or path `~` to work with `~/.agents/guardrails/` (applies across all projects). Example: `npx guardrails-ref init --user`.

## Security model

The `guardrails-ref` CLI is designed to be predictable and supply-chain friendly:

- **No network access** — the CLI never makes HTTP requests or spawns external processes.
- **Local-only filesystem writes** — writes are limited to:
  - Project-level `.agents/guardrails/` (or user-level `~/.agents/guardrails/`)
  - IDE configuration files in the current project (e.g. `.cursor/rules/agent-guardrails.md`, `.claude/instructions.md`, `.github/copilot-instructions.md`, `.windsurfrules`, `.continue/rules/agent-guardrails.md`, `.aiassistant/rules/agent-guardrails.md`, `.junie/guidelines.md`)
- **Opt-in user scope** — user-level guardrails are only written when you pass `--user` or use the `~` path explicitly.
- **Dry-run for write operations** — commands that may modify files support `--dry-run` to show what would change without writing.
- **Read-only mode** — set `GUARDRAILS_REF_READONLY=1` (or `true`) in the environment to force all commands into a non-writing mode; the CLI behaves as if `--dry-run` is enabled wherever applicable.
- **Audit mode** — set `GUARDRAILS_REF_DEBUG=1` (or `true`/`yes`) or use `--debug` to log every filesystem read/write path to stderr.

## Commands

| Command | Description |
|---------|-------------|
| `npx guardrails-ref init [path]` | Create `.agents/guardrails/`, add no-plaintext-secrets, configure IDEs |
| `npx guardrails-ref init --preset default [path]` | Add preset instead of single example (e.g. default, security) |
| `npx guardrails-ref init --minimal [path]` | Create `.agents/guardrails/` only (no example, no setup) |
| `npx guardrails-ref init --user` | Create `~/.agents/guardrails/` (user-level; setup is project-specific) |
| `npx guardrails-ref init --dry-run [path]` | Preview what would be created without writing |
| `npx guardrails-ref add <name> [name2 ...] [path]` | Add example guardrail(s) — pass multiple names to add several at once |
| `npx guardrails-ref add --preset default` | Add default preset (4 guardrails) |
| `npx guardrails-ref add --preset default,frontend` | Add multiple presets (comma-separated) |
| `npx guardrails-ref add --preset security` | Add security preset (15 guardrails) |
| `npx guardrails-ref add --preset quality` | Add quality preset (11 guardrails) |
| `npx guardrails-ref add --preset frontend` | Add frontend preset (7 guardrails) |
| `npx guardrails-ref add --preset api` | Add API preset (5 guardrails) |
| `npx guardrails-ref add --preset production` | Add production preset (12 guardrails) |
| `npx guardrails-ref add <name> --user` or `add <name> ~` | Add to user-level `~/.agents/guardrails/` |
| `npx guardrails-ref add --dry-run <name>` | Preview what would be added without writing |
| `npx guardrails-ref remove <name> [path]` | Remove a guardrail |
| `npx guardrails-ref remove <name> --user` or `remove <name> ~` | Remove from user-level |
| `npx guardrails-ref remove <name> --dry-run [path]` | Preview what would be removed without writing |
| `npx guardrails-ref setup [path]` | Add the guardrail rule to Cursor, Claude Code, VS Code Copilot, Windsurf, Continue, JetBrains |
| `npx guardrails-ref setup --remove [path]` | Remove the guardrail rule from IDE configs |
| `npx guardrails-ref setup --pre-commit [path]` | Add guardrails check to pre-commit hook (Husky or pre-commit) |
| `npx guardrails-ref setup --ide <name> [path]` | Target IDE: `cursor`, `claude`, `copilot`, `windsurf`, `continue`, `jetbrains`, `junie`, or `auto` |
| `npx guardrails-ref setup --dry-run [path]` | Show what would be added/removed without writing files |
| `npx guardrails-ref setup --check [path]` | Show which IDEs are configured and whether they have the rule |
| `npx guardrails-ref setup --check --fail-if-missing [path]` | Exit 1 if configured IDE lacks rule (CI) |
| `npx guardrails-ref validate [path]` | Validate GUARDRAIL.md files (use `--json` for JSON, `--strict` to fail on warnings, `--fix` to apply fixes) |
| `npx guardrails-ref validate --fix --dry-run [path]` | Preview which files would be fixed without writing |
| `npx guardrails-ref validate --user` or `validate ~` | Validate user-level guardrails |
| `npx guardrails-ref check [path]` | Validate with minimal output (CI-friendly, use `--strict` to fail on warnings) |
| `npx guardrails-ref upgrade [path]` | Update installed guardrails to latest templates (use `--dry-run` to preview, `--diff` to show changes) |
| `npx guardrails-ref upgrade --user` or `upgrade ~` | Upgrade user-level guardrails |
| `npx guardrails-ref diff [path]` | Show diff between installed guardrails and latest templates |
| `npx guardrails-ref list [path]` | List discovered guardrails (use `--json` for JSON, `--compact` for one per line) |
| `npx guardrails-ref list --user` or `list ~` | List user-level guardrails |
| `npx guardrails-ref why <name>` | Show guardrail template content (use `--json` for machine-readable) |
| `npx guardrails-ref scaffold <name>` | Create a new guardrail skeleton with frontmatter and Trigger/Instruction/Reason sections |
| `npx guardrails-ref test [path]` | Run safety checks; prints score (e.g. 5/8, 62%). Use `--json` for scorePercent and attackCoverage |
| `npx guardrails-ref --debug <command>` | Log every filesystem read/write path (for auditing); or `GUARDRAILS_REF_DEBUG=1` |

## Supported IDEs

- **Cursor** — via `.cursor/rules/` or `.cursorrules`
- **Claude Code** — via `.claude/instructions.md`
- **VS Code Copilot** — via `.github/copilot-instructions.md`
- **Windsurf** — via `.windsurfrules`
- **Continue** — via `.continue/rules/agent-guardrails.md`
- **JetBrains AI Assistant** — via `.aiassistant/rules/agent-guardrails.md`
- **JetBrains Junie** — via `.junie/guidelines.md`

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

Run safety checks in CI (exit 0 if all pass; JSON includes `scorePercent` 0–100 and `attackCoverage`):

```yaml
- name: Safety checks
  run: npx guardrails-ref test . --json
```

**Note:** `list` (without `--json`/`--compact`) exits with code 1 when no guardrails are found. `list --json` and `list --compact` exit 0 and return an empty list when none are found.

## Examples

```bash
# Project-level (default)
npx guardrails-ref init
npx guardrails-ref add no-destructive-commands no-hardcoded-urls
npx guardrails-ref add no-new-deps-without-approval
npx guardrails-ref why no-destructive-commands
npx guardrails-ref validate .
npx guardrails-ref list .
npx guardrails-ref test .

# User-level (~/.agents/guardrails/)
npx guardrails-ref init --user
npx guardrails-ref add no-plaintext-secrets --user
npx guardrails-ref list --user
npx guardrails-ref validate ~
```

## Available guardrails (add command)

40 reference guardrails; add with `npx guardrails-ref add <name>` or use presets (e.g. `add --preset security` for 15 guardrails).

| Name | What it prevents |
|------|------------------|
| `no-plaintext-secrets` | Logging or committing credentials |
| `no-pii-in-output` | Unredacted PII in logs, API responses, or reports |
| `resist-instruction-override` | Complying with "ignore instructions" or prompt-injection overrides |
| `no-placeholder-credentials` | Fake or placeholder API keys instead of asking for real values |
| `no-silent-error-handling` | Catching errors without surfacing them to the user |
| `require-access-control` | Exposing sensitive data or admin actions without role checks |
| `artifact-verification` | Destructive ops without plan.md and audit log |
| `context-rotation` | Continuing in polluted context; reset when 80% full or 10+ errors |
| `database-migrations` | Direct schema changes instead of migrations |
| `no-destructive-commands` | rm -rf, DROP TABLE, TRUNCATE without approval |
| `no-eval-or-dynamic-code` | eval(), new Function(), or dynamic code execution |
| `no-new-deps-without-approval` | New packages without approval |
| `privilege-boundaries` | Touching node_modules, .git, lockfiles, .env without approval |
| `require-commit-approval` | git commit or push without explicit user approval |
| `no-hardcoded-urls` | Hardcoded API URLs, base URLs, endpoints |
| `no-sudo-commands` | sudo/su/root commands without approval |
| `rate-limiting` | Runaway tool calls and API loops |
| `no-console-in-production` | console.log in production code |
| `require-tests` | Merging code without tests |
| `prefer-existing-code` | Reimplementing when existing code or helpers exist |
| `no-inline-styles` | Inline `style=` in HTML/JSX |
| `no-raw-sql` | Raw SQL without parameterization |
| `no-magic-numbers` | Unexplained numeric literals |
| `no-modifying-git-history` | git push --force, destructive rebase without approval |
| `no-deprecated-apis` | Suggesting deprecated or obsolete APIs |
| `no-unsafe-env-assumptions` | Assuming env vars exist without validation |
| `no-hardcoded-user-facing-strings` | Hardcoded labels, messages, errors in UI |
| `require-accessibility` | Missing alt text, ARIA, keyboard support, or contrast in UI |
| `require-api-resilience` | API calls without timeouts, retries, or error handling |
| `require-documentation-updates` | Changing behavior without updating README, docs, or changelog |
| `no-breaking-changes-without-versioning` | Breaking public APIs without semver bump or migration path |
| `no-path-traversal` | User-controlled paths without validation (`..`, symlinks outside base) |
| `no-unsafe-html-injection` | Raw dangerouslySetInnerHTML or unsanitized HTML (XSS) |
| `no-client-only-access-control` | Authorization only in the client; server must re-validate |
| `require-loading-and-error-states` | Async UI without loading and error states |
| `require-form-validation` | Forms without validation, field-level errors, or preserved input on error |
| `require-design-tokens` | Hardcoded colors, spacing, or typography instead of design tokens |
| `no-prompt-leaks` | Leaking internal prompts, system messages, or guardrails into code/logs/docs |
| `require-logging-standards` | Logging without structure, clear levels, or protection against secrets/PII |
| `tools-permissions` | Unsafe or overly powerful tools without allow lists, thresholds, or approvals |

Use `npx guardrails-ref add --list` to see all available guardrails. Use `npx guardrails-ref why <name>` to show a guardrail's full content (from templates).

## Troubleshooting

- **"Unknown guardrail"** — Run `npx guardrails-ref add --list` to see available guardrail names
- **Setup not working** — Try `npx guardrails-ref setup --remove` then `npx guardrails-ref setup` again

## Links

- [GitHub](https://github.com/9atar6/agent-guardrails) — Full repo, spec, examples
- [Changelog](https://github.com/9atar6/agent-guardrails/blob/main/CHANGELOG.md) — Version history

## License

MIT — [GitHub](https://github.com/9atar6/agent-guardrails)
