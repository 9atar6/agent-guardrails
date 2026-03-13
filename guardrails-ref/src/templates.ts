/**
 * Load templates from examples/ at runtime. Falls back to bundled templates
 * when examples directory is not available (e.g. edge cases).
 * Single source of truth: agent-guardrails/examples/
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "node:url";
import { parseGuardrailFile } from "./parse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Bundled fallback when examples/ is not available */
const BUNDLED: Record<string, string> = {
  "no-plaintext-secrets": `---
name: no-plaintext-secrets
description: Never log, commit, or expose API keys, passwords, or tokens. Use environment variables or secrets managers. Apply when adding logging, implementing auth, or integrating third-party APIs.
scope: project
severity: critical
triggers:
  - "Adding logging"
  - "Implementing authentication"
  - "API integration"
  - "Handling credentials"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Plaintext Secrets

## Trigger
Implementing authentication endpoints, adding logging, integrating third-party APIs, or handling any user credentials or API keys.

## Instruction
- Never store, log, or commit plaintext credentials (API keys, passwords, tokens, sessions)
- Always use environment variables or secrets managers (e.g. 1Password, Vault)
- Use bcrypt with 12 salt rounds for password hashing
- Always require HTTPS for authentication endpoints
- Use a \`redactSensitive()\` helper when logging objects that may contain secrets
- Audit all logs before committing to ensure no credentials are included

## Reason
API keys were exposed in git during a 2025 security audit. Plaintext credentials in logs led to emergency key rotation.
`,
};

function loadTemplatesFromDir(examplesDir: string): Record<string, string> {
  const templates: Record<string, string> = {};
  if (!existsSync(examplesDir)) return templates;

  const entries = readdirSync(examplesDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const file = join(examplesDir, ent.name, "GUARDRAIL.md");
    if (!existsSync(file)) continue;
    try {
      const result = parseGuardrailFile(file);
      if (result.success && result.guardrail) {
        const key = ent.name.toLowerCase().replace(/\s+/g, "-");
        const content = readFileSync(file, "utf-8");
        templates[key] = content;
      } else if (result.errors.length > 0) {
        console.warn(`guardrails-ref: skipped ${file}: ${result.errors.join("; ")}`);
      }
    } catch (err) {
      console.warn(`guardrails-ref: skipped ${file}: ${(err as Error).message}`);
    }
  }
  return templates;
}

function getTemplates(): Record<string, string> {
  // Try: 1) guardrails-ref/examples (published pkg), 2) ../examples (repo root when developing)
  const candidates = [
    join(__dirname, "..", "examples"),
    join(__dirname, "..", "..", "examples"),
  ];
  for (const examplesDir of candidates) {
    const fromDisk = loadTemplatesFromDir(examplesDir);
    if (Object.keys(fromDisk).length > 0) {
      return fromDisk;
    }
  }
  return BUNDLED;
}

export const TEMPLATES = getTemplates();
export const TEMPLATE_NAMES = Object.keys(TEMPLATES);

/** Preset names to guardrail names. */
export const PRESETS: Record<string, string[]> = {
  default: [
    "no-plaintext-secrets",
    "no-destructive-commands",
    "no-new-deps-without-approval",
    "require-commit-approval",
  ],
  security: [
    "no-plaintext-secrets",
    "no-placeholder-credentials",
    "require-access-control",
    "privilege-boundaries",
    "no-eval-or-dynamic-code",
    "no-hardcoded-urls",
    "no-path-traversal",
    "no-raw-sql",
    "no-unsafe-env-assumptions",
    "no-prompt-leaks",
  ],
  quality: [
    "no-magic-numbers",
    "no-inline-styles",
    "prefer-existing-code",
    "require-tests",
    "no-silent-error-handling",
    "no-console-in-production",
    "no-deprecated-apis",
    "no-hardcoded-user-facing-strings",
  ],
  frontend: [
    "require-accessibility",
    "no-inline-styles",
    "no-hardcoded-user-facing-strings",
  ],
  api: [
    "require-api-resilience",
    "no-hardcoded-urls",
    "no-unsafe-env-assumptions",
    "no-placeholder-credentials",
  ],
  production: [
    "require-tests",
    "no-console-in-production",
    "require-api-resilience",
    "database-migrations",
    "require-documentation-updates",
    "no-breaking-changes-without-versioning",
    "no-prompt-leaks",
    "require-logging-standards",
  ],
};
