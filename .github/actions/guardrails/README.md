# Guardrails Check Action

Validate Agent Guardrails in your GitHub Actions workflow.

## Usage

```yaml
- uses: 9atar6/agent-guardrails/.github/actions/guardrails@main
  with:
    path: '.'        # optional, default: .
    strict: 'false'  # optional, set 'true' to fail on warnings
```

## Example

```yaml
jobs:
  guardrails:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: 9atar6/agent-guardrails/.github/actions/guardrails@main
        with:
          strict: 'true'
```
