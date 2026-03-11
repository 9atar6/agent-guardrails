import { test } from "node:test";
import assert from "node:assert";
import { join, dirname } from "path";
import { fileURLToPath } from "node:url";
import { writeFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { parseGuardrailFile } from "../dist/parse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const examplesDir = join(__dirname, "..", "..", "examples");

test("parseGuardrailFile: valid guardrail", () => {
  const path = join(examplesDir, "no-plaintext-secrets", "GUARDRAIL.md");
  const result = parseGuardrailFile(path);
  assert.strictEqual(result.success, true);
  assert.ok(result.guardrail);
  assert.strictEqual(result.guardrail.name, "no-plaintext-secrets");
  assert.ok(result.guardrail.description.includes("Never log"));
  assert.strictEqual(result.errors.length, 0);
});

test("parseGuardrailFile: missing file", () => {
  const result = parseGuardrailFile("/nonexistent/path/GUARDRAIL.md");
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some((e) => e.includes("Cannot read file")));
});

test("parseGuardrailFile: invalid YAML", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-test-"));
  try {
    const path = join(dir, "GUARDRAIL.md");
    writeFileSync(path, "---\nname: [unclosed\n---\n\n# Test\n");
    const result = parseGuardrailFile(path);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors.length > 0);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("parseGuardrailFile: missing name", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-test-"));
  try {
    const path = join(dir, "GUARDRAIL.md");
    writeFileSync(
      path,
      `---
description: A valid description here.
---

# Test
`
    );
    const result = parseGuardrailFile(path);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("name")));
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("parseGuardrailFile: missing description", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-test-"));
  try {
    const path = join(dir, "GUARDRAIL.md");
    writeFileSync(
      path,
      `---
name: valid-name
---

# Test
`
    );
    const result = parseGuardrailFile(path);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("description")));
  } finally {
    rmSync(dir, { recursive: true });
  }
});
