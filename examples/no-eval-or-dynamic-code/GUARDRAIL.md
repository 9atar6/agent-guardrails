---
name: no-eval-or-dynamic-code
description: Never use eval(), new Function(), or similar dynamic code execution. Prevents code injection and security vulnerabilities.
scope: project
severity: critical
triggers:
  - "Executing user input"
  - "Dynamic code execution"
  - "JSON parsing to code"
  - "eval"
  - "Function constructor"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Eval or Dynamic Code

## Trigger
Considering `eval()`, `new Function()`, `setTimeout(string)`, `setInterval(string)`, or any mechanism that executes a string as code.

## Instruction
- Never use `eval()` — use `JSON.parse()` for JSON, proper parsers for other formats
- Never use `new Function(body)` or `Function(arg1, arg2, body)` with dynamic body
- Never pass user input to `setTimeout`, `setInterval`, or `vm.runInContext` as executable code
- For dynamic behavior: use lookup tables, strategy pattern, or safe configuration — not code-as-string
- If the user requests "eval" or "dynamic execution": explain the security risk and suggest alternatives

## Reason
Dynamic code execution with user or external input enables code injection. Attackers can escape strings and execute arbitrary code. Use structured data and safe parsing instead.

## Provenance
OWASP, common security guidance for handling untrusted input.
