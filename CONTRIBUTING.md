# Contributing to Agent Guardrails

Thank you for your interest in contributing. This document explains how to get started.

## How to contribute

### Add a new guardrail example

1. Create a new directory under `examples/` with a descriptive name (e.g. `no-inline-styles`)
2. Add a `GUARDRAIL.md` file following the [specification](spec/specification.md)
3. Add the content to `guardrails-ref/src/templates.ts` so `npx guardrails-ref add <name>` works
4. Run `npm run validate` to ensure it passes
5. Open a pull request

### Improve the specification

1. Edit `spec/specification.md` or `spec/client-implementation.md`
2. Update the validator in `guardrails-ref/src/` if the format changes
3. Ensure all examples still validate

### Add a feature to the CLI

1. Edit `guardrails-ref/src/` (cli.ts, validate.ts, etc.)
2. Run `npm run build` in `guardrails-ref/`
3. Run `npm run validate` to test

## Development setup

```bash
cd agent-guardrails
cd guardrails-ref && npm install && npm run build
cd ..
npm run validate   # Validate all examples
npm run list       # List guardrails
```

## Pull request process

1. Fork the repository
2. Create a branch from `main`
3. Make your changes
4. Ensure `npm run validate` passes
5. Open a PR with a clear description

## Publishing (for maintainers)

Before publishing to npm:

1. Ensure `repository` / `bugs` / `homepage` in `guardrails-ref/package.json` point to the correct GitHub repo
2. Create an [npm account](https://www.npmjs.com/signup) if needed
3. Run `npm login` in a terminal
4. Run `cd guardrails-ref && npm publish` (builds automatically via prepublishOnly)

## GitHub topics (for discoverability)

On the repo page, click the gear icon next to "About" and add topics: `agent`, `guardrails`, `ai`, `cursor`, `claude`, `specification`

## Code of conduct

Be respectful and constructive. This is an open format for the AI coding community.
