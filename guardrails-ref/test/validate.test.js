import { test } from "node:test";
import assert from "node:assert";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { validatePath, listGuardrails } from "../dist/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const examplesDir = join(__dirname, "..", "..", "examples");

test("validatePath: examples directory", () => {
  const result = validatePath(examplesDir);
  assert.ok(result.total >= 12);
  assert.strictEqual(result.invalid, 0);
  assert.strictEqual(result.valid, result.total);
});

test("validatePath: single file", () => {
  const path = join(examplesDir, "no-plaintext-secrets", "GUARDRAIL.md");
  const result = validatePath(path);
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.valid, 1);
  assert.strictEqual(result.invalid, 0);
});

test("listGuardrails: examples directory", () => {
  const guardrails = listGuardrails(examplesDir);
  assert.ok(guardrails.length >= 12);
  const names = guardrails.map((g) => g.name);
  assert.ok(names.includes("no-plaintext-secrets"));
  assert.ok(names.includes("no-console-in-production"));
  assert.ok(names.includes("no-hardcoded-urls"));
  assert.ok(names.includes("no-sudo-commands"));
  assert.ok(names.includes("require-tests"));
  assert.ok(names.includes("no-inline-styles"));
  assert.ok(names.includes("no-raw-sql"));
  assert.ok(names.includes("no-magic-numbers"));
  guardrails.forEach((g) => {
    assert.ok(g.name);
    assert.ok(g.description);
    assert.ok(g.path);
  });
});

test("validatePath: nonexistent path", () => {
  const result = validatePath("/nonexistent/path/12345");
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.invalid, 1);
  assert.ok(result.results[0].errors.length > 0);
});
