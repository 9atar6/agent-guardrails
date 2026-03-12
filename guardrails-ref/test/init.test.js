import { test } from "node:test";
import assert from "node:assert";
import { join } from "path";
import { mkdtempSync, existsSync, rmSync } from "fs";
import { tmpdir } from "os";
import { runInit } from "../dist/init.js";

test("runInit --minimal: creates .agents/guardrails/ only", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-init-minimal-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runInit(dir, true);
    assert.ok(existsSync(join(dir, ".agents", "guardrails")));
    assert.ok(!existsSync(join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md")));
    assert.ok(!existsSync(join(dir, ".cursor", "rules", "agent-guardrails.md")));
    assert.strictEqual(result.exampleCreated, false);
    assert.strictEqual(result.setupDone, "");
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runInit: full init creates example and runs setup", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-init-full-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runInit(dir, false);
    assert.ok(existsSync(join(dir, ".agents", "guardrails")));
    assert.ok(existsSync(join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md")));
    assert.ok(existsSync(join(dir, ".cursor", "rules", "agent-guardrails.md")) || existsSync(join(dir, ".cursorrules")));
    assert.ok(result.exampleCreated || result.setupDone);
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runInit --preset default: adds preset guardrails", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-init-preset-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runInit(dir, false, false, "default");
    assert.ok(existsSync(join(dir, ".agents", "guardrails")));
    for (const name of ["no-plaintext-secrets", "no-destructive-commands", "no-new-deps-without-approval", "require-commit-approval"]) {
      assert.ok(existsSync(join(dir, ".agents", "guardrails", name, "GUARDRAIL.md")), `Expected ${name}`);
    }
    assert.ok(result.exampleCreated || result.setupDone);
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});
