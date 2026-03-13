# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.8] - 2026-03-13

### Added

- **scaffold command** — `npx guardrails-ref scaffold <name>` creates a new guardrail skeleton with valid frontmatter and Trigger/Instruction/Reason sections (supports `--scope`, `--severity`, `--path`, `--user`, `--dry-run` and honors `GUARDRAILS_REF_READONLY`).
- **New guardrails** — `no-prompt-leaks` (prevent leaking internal prompts and guardrails) and `require-logging-standards` (structured, safe logging); added to the security and production presets where appropriate.

### Changed

- **parse** — Emits non-fatal warnings when guardrail bodies are very short or missing Trigger/Instruction/Reason headings, nudging custom guardrails toward the recommended structure.
- **presets** — Updated `security` and `production` presets to include the new guardrails.
- **website examples** — Examples page now lists `no-prompt-leaks` and `require-logging-standards` and reflects updated preset composition.

## [1.2.7] - 2026-03-13

### Added

- **validate --dry-run --fix** — Preview which guardrail files would be normalized without writing, and honor a global read-only mode via `GUARDRAILS_REF_READONLY`.
- **init --dry-run** — Show which `.agents/guardrails/` entries and IDE configs would be created without touching the filesystem.
- **remove --dry-run** — Show which guardrails (and empty `.agents/guardrails/` directories) would be removed.

### Changed

- **validate / fixGuardrailFile** — Surface YAML frontmatter parse errors as warnings instead of silently ignoring them; log directories and paths that cannot be read or stat'ed.
- **CLI** — Added `GUARDRAILS_REF_READONLY` support for all write-capable commands (mapping to dry-run) and wrapped the command dispatcher in a top-level error handler for cleaner unexpected error reporting.
- **init --dry-run** — Now passes dry-run to setup; IDE config files are no longer written when using `--dry-run`.
- **package.json** — Added `sideEffects: false` for bundler/tooling.
- **README** — Added `init --dry-run`, `remove --dry-run`, and `validate --fix --dry-run` to the commands table.
- **--debug** — Global flag (or `GUARDRAILS_REF_DEBUG=1`) logs every filesystem read/write path to stderr for auditing.

## [1.2.6] - 2026-03-12

### Added

- **add --dry-run** — Preview what would be added without writing files
- **list --compact** — One name per line for scripting (e.g. piping to xargs)
- **why --json** — Machine-readable guardrail content (name, description, body)
- **setup --check --fail-if-missing** — Exit 1 if configured IDE lacks rule (CI enforcement)
- **GitHub Action** — `.github/actions/guardrails` for validate/check in workflows
- **Website** — Copy buttons for add commands on examples page; modal with full guardrail content; preset modal with guardrail list; clickable guardrail names in preset modal open guardrail modal; click table name again to close modal; mobile: only one modal at a time

### Changed

- **validate --fix** — Broader auto-fix: frontmatter key normalization (name, description, scope, severity, triggers, license, metadata), whitespace, newline; may reformat quote style
- **validate / parse** — Actionable hints in error messages
- **Website** — og:image, CSP headers, mobile layout improvements; copy button fixed at right edge of Name column; preset modal guardrail links styled as links; full-width layout on mobile; table layout (fixed columns) for desktop and mobile

## [1.2.5] - 2026-03-12

### Added

- **5 new guardrails** — High-impact examples for developers:
  - **require-accessibility** — Alt text, ARIA, keyboard support, contrast for UI
  - **require-api-resilience** — Timeouts, retries, error handling for external API calls
  - **require-documentation-updates** — Update README, docs, changelog when changing behavior
  - **no-breaking-changes-without-versioning** — Semver bump, deprecation, migration path for public APIs
  - **no-path-traversal** — Validate user-controlled paths; reject `..`, symlinks outside base
- **4 new presets** — quality (8), frontend (3), api (4), production (6); security preset now includes no-path-traversal (9 total)
- **Multiple presets** — `add --preset default,frontend` adds both presets in one command
- **init --preset** — Add a preset at init: `init --preset default` or `init --preset security`

### Changed

- **Website** — Official site at [agentguardrails.dev](https://agentguardrails.dev)
- **README** — Added prominent website link
- **package.json** — Updated homepage to agentguardrails.dev

## [1.2.4] - 2026-03-12

### Added

- **Windsurf, Continue, JetBrains** — `setup` now configures 4 additional IDEs:
  - **Windsurf** — via `.windsurfrules`
  - **Continue** — via `.continue/rules/agent-guardrails.md`
  - **JetBrains AI Assistant** — via `.aiassistant/rules/agent-guardrails.md`
  - **JetBrains Junie** — via `.junie/guidelines.md`
- **setup --pre-commit** — Add guardrails check to pre-commit hook (Husky or pre-commit)
- **add --preset** — Add preset guardrail sets: `add --preset default` or `add --preset security`
- **diff command** — Show diff between installed guardrails and latest templates (alias for `upgrade --dry-run --diff`)
- **validate --fix** — Apply trivial fixes (trim trailing whitespace, normalize trailing newline)

### Changed

- **setup --ide** — Now accepts: cursor, claude, copilot, windsurf, continue, jetbrains, junie, or auto
- **setup --check** — Displays status for all 7 supported IDEs

## [1.2.3] - 2026-03-11

### Changed

- **CONTRIBUTING.md** — Publish workflow for maintainers

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

- **CLI options** — `validate --json`, `validate --strict`, `check --strict`, `list --json`, and `upgrade --dry-run`/`--diff` now correctly read options

## [1.1.0] - 2026-03-11

### Added

- **SECURITY.md** — Security policy for vulnerability reporting
- **GUARDRAILS.md test** — Validate now has a test for `GUARDRAILS.md` at project root
- **list exit code test** — Test that `list` exits 1 when no guardrails found

### Changed

- **list** — Exits with code 1 when no guardrails found (CI-friendly for scripts)
- **parse** — Cross-platform path handling; directory-name check only applies to `GUARDRAIL.md` in subdirs, not `GUARDRAILS.md` at root
- **Client implementation guide** — Mentions VS Code Copilot as a target agent
- **setup** — Documented that empty files are removed when rule is removed

## [1.0.9] - 2026-03-11

### Fixed

- **CLI** — validate, check, list now correctly parse options
- **add** — `--path` takes precedence over positional path when both are provided
- **setup** — Rule removal marker now more specific to reduce false positives
- **validate** — Results now include `guardrail` for successful parses; listGuardrails no longer parses files twice
- **upgrade** — "All X already up to date" now prints in dry-run mode too

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

- **guardrails-ref README** — Badges, quick start, CI examples, troubleshooting, supported IDEs

## [1.0.4] - 2026-03-11

### Fixed

- **npm package** — README now displays correctly on npm

## [1.0.3] - 2026-03-11

### Added

- **validate --json** — JSON output for scripting and CI
- **Automated tests** — Parse, validate, add, remove (Node built-in test runner)
- **GitHub Action** — Validate examples and run tests on push/PR

### Fixed

- **README** — Added remove command to project structure and docs

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
