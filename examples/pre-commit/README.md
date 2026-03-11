# Pre-commit example

Run `npx guardrails-ref check` before commits to ensure guardrails are valid.

## Option 1: pre-commit (Python)

Install [pre-commit](https://pre-commit.com/) and add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: guardrails-check
        name: Validate guardrails
        entry: npx guardrails-ref check . --strict
        language: system
        pass_filenames: false
```

Then run `pre-commit install`.

## Option 2: Husky (Node)

```bash
npm install -D husky
npx husky init
```

Add to `.husky/pre-commit`:

```sh
#!/bin/sh
npx guardrails-ref check . --strict
```

## Option 3: npm script

In `package.json`:

```json
{
  "scripts": {
    "precommit": "npx guardrails-ref check . --strict"
  }
}
```

Then use with husky or lint-staged.
