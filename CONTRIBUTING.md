# Contributing to Agent Guardrails

Thank you for your interest in contributing. This document explains how to get started.

## How to contribute

### Add a new guardrail example

1. Create `examples/<name>/GUARDRAIL.md` (e.g. `examples/no-inline-styles/GUARDRAIL.md`) following the [specification](spec/specification.md)
2. Run `npm run build` in `guardrails-ref/` (copies examples into the package)
3. Run `npm run validate` and `npm run test` to ensure they pass
4. Open a pull request

Templates load from `examples/` at runtime — no need to edit `templates.ts`. **Exception:** If you edit `examples/no-plaintext-secrets/GUARDRAIL.md`, also update the `BUNDLED` fallback in `guardrails-ref/src/templates.ts` (used when examples are unavailable).

### Improve the specification

1. Edit `spec/specification.md` or `spec/client-implementation.md`
2. Update the validator in `guardrails-ref/src/` if the format changes
3. Ensure all examples still validate

### Add a feature to the CLI

1. Edit `guardrails-ref/src/` (cli.ts, validate.ts, etc.)
2. Run `npm run build` in `guardrails-ref/`
3. Run `npm run validate` and `npm test` to test

## Development setup

```bash
cd agent-guardrails
cd guardrails-ref; npm install; npm run build
cd ..
npm run validate   # Validate all examples
npm run list       # List guardrails
npm run test       # Run automated tests
```

> **Windows (PowerShell):** Use `;` instead of `&&` to chain commands. Example: `cd guardrails-ref; npm run test; cd ..`

## Pull request process

1. Fork the repository
2. Create a branch from `main`
3. Make your changes
4. Ensure `npm run validate` and `npm run test` pass
5. Open a PR with a clear description

## Publishing (for maintainers)

**Pre-publish:** Update version in `guardrails-ref/package.json`, update CHANGELOG.md, run `cd guardrails-ref && npm run test`.

**Publish workflow:**

```bash
cd agent-guardrails
cd guardrails-ref && npm run test && cd ..
git add -A && git commit -m "chore: release vX.Y.Z" && git push origin main
cd guardrails-ref && npm version patch && npm publish && cd ..
```

The build (run automatically by `prepublishOnly`) copies `../examples` into the package and compiles TypeScript. It fails if `../examples` is missing — run from the full repo.

**Adding a guardrail:** Create `examples/<name>/GUARDRAIL.md`; no code changes needed. Build copies it into the package.

## GitHub topics (for discoverability)

On the repo page, click the gear icon next to "About" and add topics: `agent`, `guardrails`, `ai`, `cursor`, `claude`, `specification`

## Code of conduct

Be respectful and constructive. This is an open format for the AI coding community.
