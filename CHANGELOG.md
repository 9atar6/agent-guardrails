# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.2] - 2026-03-11

### Added

- **User-level guardrails** — CLI now supports `~/.agents/guardrails/` per spec:
  - `init --user` — Create user-level dir and add no-plaintext-secrets (setup is project-specific)
  - `add <name> --user` or `add <name> ~` — Add to user scope
  - `remove <name> --user` or `remove <name> ~` — Remove from user scope
  - `upgrade --user` or `upgrade ~` — Upgrade user-level guardrails
  - `list --user` or `list ~` — List user-level guardrails
  - `validate --user` or `validate ~` — Validate user-level guardrails

## [1.2.1] - 2026-03-11

### Added

- **artifact-verification** — Before destructive ops, generate plan.md for human review and log to audit trail (from [guardrails.md](https://guardrails.md/) Pattern 1)
- **privilege-boundaries** — Define allowed/forbidden paths; never touch node_modules, .git, lockfiles, .env without approval (from [guardrails.md](https://guardrails.md/) Pattern 3)
- **context-rotation** — When context exceeds 80% or 10+ errors, save state, summarize, reset to prevent "The Gutter" (from [guardrails.md](https://guardrails.md/) Pattern 2)
- **require-commit-approval** — Never run git commit or push without explicit user approval
- **no-eval-or-dynamic-code** — Never use eval(), new Function(), or dynamic code execution; prevents code injection

### Changed

- **no-plaintext-secrets** — Added "Audit all logs before committing" (from guardrails.md credential leak case study)

## [1.2.0] - 2026-03-11

### Added

- **no-silent-error-handling** — Never catch errors without surfacing them to the user
- **no-placeholder-credentials** — Never use fake or placeholder API keys; ask for real values
- **prefer-existing-code** — Prefer existing code and shared helpers over reimplementing
- **require-access-control** — Enforce role or permission checks when handling sensitive data or admin actions
- **no-modifying-git-history** — Never run `git push --force` or destructive rebase without explicit approval
- **no-deprecated-apis** — Never suggest deprecated or obsolete APIs; check current docs
- **no-unsafe-env-assumptions** — Validate required env vars at startup; fail fast with clear errors
- **no-hardcoded-user-facing-strings** — Use i18n keys or shared constants for user-facing text

### Changed

- **Existing guardrails** — Added Provenance to 6 guardrails (no-hardcoded-urls, no-sudo-commands, require-tests, no-raw-sql, no-magic-numbers, no-inline-styles); fixed no-inline-styles Instruction/Reason separation

## [1.1.1] - 2026-03-11

### Added

- **VS Code Copilot support** — `setup` now adds the guardrail rule to `.github/copilot-instructions.md` (GitHub Copilot's project instructions file)
- **setup --ide &lt;name&gt;** — Target a specific IDE: `cursor`, `claude`, `copilot`, or `auto` (e.g. `npx guardrails-ref setup --ide copilot`). Use `auto` to only configure IDEs that already have config files
- **setup --check** — Show which IDEs are configured and whether they have the guardrail rule
- **setup --dry-run** — Show what would be added/removed without writing files (e.g. `npx guardrails-ref setup --dry-run`)
- **why &lt;name&gt;** — Show guardrail content (e.g. `npx guardrails-ref why no-destructive-commands`)
- **init --minimal** — Create `.agents/guardrails/` only, no example and no setup (e.g. `npx guardrails-ref init --minimal`)

### Changed

- **setup** — Configures Cursor, Claude Code, and VS Code Copilot by default (previously only Cursor and Claude Code)

### Fixed

- **CLI options** — `validate --json`, `validate --strict`, `check --strict`, `list --json`, and `upgrade --dry-run`/`--diff` now correctly read options (Commander `this.opts()` fix)

## [1.1.0] - 2026-03-11

### Added

- **SECURITY.md** — Security policy for vulnerability reporting
- **GUARDRAILS.md test** — Validate now has a test for `GUARDRAILS.md` at project root
- **list exit code test** — Test that `list` exits 1 when no guardrails found

### Changed

- **Version sync** — Root and guardrails-ref package.json both at 1.1.0
- **list** — Exits with code 1 when no guardrails found (CI-friendly for scripts)
- **parse** — Uses `path.dirname` and `path.basename` for cross-platform path handling; directory-name check only applies to `GUARDRAIL.md` in subdirs, not `GUARDRAILS.md` at root
- **Client implementation guide** — Mentions VS Code Copilot as a target agent
- **setup** — Documented that empty files are removed when rule is removed

### Fixed

- **Tutorial** — Removed stray duplicate sentence in Part 5
- **Tests** — `parse.test.js` and `validate.test.js` now use `node:url` import for consistency

## [1.0.9] - 2026-03-11

### Fixed

- **CLI** — validate, check, list now use `cmd.opts()` consistently for options (fixes potential option parsing issues)
- **add** — `--path` takes precedence over positional path when both are provided
- **setup** — Rule removal marker now more specific to reduce false positives (e.g. "You MUST read...")
- **listGuardrails** — No longer parses files twice (uses cached guardrail from validate result)
- **upgrade** — "All X already up to date" now prints in dry-run mode too
- **e2e test** — Removed unused import

### Changed

- **validate** — Results now include `guardrail` for successful parses (avoids redundant parsing)

## [1.0.8] - 2026-03-11

### Added

- **Bulk add** — Add multiple guardrails in one command: `npx guardrails-ref add no-destructive-commands no-hardcoded-urls rate-limiting`
- **upgrade --diff** — Show unified diff for each updated guardrail (use with `--dry-run` to preview changes)

### Fixed

- **remove** — "Installed" hint now lists only `.agents/guardrails/` contents, not guardrails from elsewhere in the project
- **parse** — Directory-name check no longer triggers for files at project root (e.g. `GUARDRAIL.md`)
- **validate** — Non-guardrail files (e.g. `README.md`) now return an explicit error instead of "No GUARDRAIL.md files found"

## [1.0.7] - 2026-03-11

### Added

- **add --list** — List available guardrails to add (e.g. `npx guardrails-ref add --list`)
- **upgrade command** — Update installed guardrails to latest template versions (use `--dry-run` to preview)
- **no-raw-sql** — Never use raw SQL with string concatenation; use parameterized queries
- **no-magic-numbers** — No unexplained numeric literals; use named constants
- **Pre-commit example** — `examples/pre-commit/README.md` with pre-commit, Husky, and npm script options

## [1.0.6] - 2026-03-11

### Added

- **check command** — Validate with minimal output (CI-friendly alias)
- **require-tests** — Never merge code without tests
- **no-inline-styles** — No inline `style=` in HTML/JSX

### Fixed

- **CLI version** — Reads from package.json instead of hardcoded value

### Changed

- **Main README** — Windows/PowerShell note, `check` command, 10 examples

## [1.0.5] - 2026-03-11

### Added

- **Templates from disk** — Load guardrails from `examples/` at runtime; single source of truth, no duplication with `templates.ts`
- **validate --strict** — Fail on warnings (CI mode)
- **setup --remove** — Undo setup (remove rule from Cursor/Claude config)
- **no-hardcoded-urls** — Never hardcode API URLs, base URLs, endpoints
- **no-sudo-commands** — No sudo/su/root commands without explicit approval

### Changed

- **copy-examples** — Fails with exit 1 if `../examples` is missing (prevents publishing without examples)
- **Template loading** — Validates guardrails with parser; skips invalid files and warns to stderr
- **guardrails-ref README** — Badges, quick start, CI examples, troubleshooting, supported IDEs

## [1.0.4] - 2026-03-11

### Fixed

- **npm README** — Added README.md to package files so npm displays it (was showing "This package does not have a README")

## [1.0.3] - 2026-03-11

### Added

- **validate --json** — JSON output for scripting and CI
- **Automated tests** — Parse, validate, add, remove (Node built-in test runner)
- **GitHub Action** — Validate examples and run tests on push/PR

### Fixed

- **README** — Added remove command to project structure and docs
- **Templates** — Synced license and metadata with examples (no drift)

## [1.0.2] - 2026-03-11

### Added

- **remove command** — Remove a guardrail from .agents/guardrails/
- **no-console-in-production** — New example guardrail (no console.log in production)
- **list --json** — JSON output for scripting

## [1.0.0] - 2026-03-11

### Added

- **Specification** — Formal GUARDRAIL.md format with YAML frontmatter and Markdown body
- **Client implementation guide** — Instructions for IDE vendors to add native support
- **guardrails-ref CLI** — Validate, list, init, setup, and add guardrails
- **5 example guardrails:**
  - `no-plaintext-secrets` — Never log or commit credentials
  - `database-migrations` — Always use migration files
  - `no-destructive-commands` — No rm -rf, DROP, TRUNCATE without approval
  - `no-new-deps-without-approval` — No new packages without approval
  - `rate-limiting` — Limit tool calls and API loops
- **Tutorial** — Beginner's guide
- **Relationship to guardrails.md** — Formalizes the Signs pattern
