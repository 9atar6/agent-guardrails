# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
