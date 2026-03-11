# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
