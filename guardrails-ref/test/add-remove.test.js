import { test } from "node:test";
import assert from "node:assert";
import { join } from "path";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { runAdd } from "../dist/add.js";
import { runRemove } from "../dist/remove.js";

test("runAdd: adds guardrail", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-add-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const added = runAdd("no-plaintext-secrets", dir);
    assert.strictEqual(added, true);
    const path = join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md");
    assert.ok(existsSync(path));
    const content = readFileSync(path, "utf-8");
    assert.ok(content.includes("name: no-plaintext-secrets"));
    assert.ok(content.includes("No Plaintext Secrets"));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runAdd: unknown guardrail returns false", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-add-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const added = runAdd("unknown-guardrail-xyz", dir);
    assert.strictEqual(added, false);
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runRemove: removes guardrail", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-remove-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    runAdd("no-plaintext-secrets", dir);
    const path = join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md");
    assert.ok(existsSync(path));
    const removed = runRemove("no-plaintext-secrets", dir);
    assert.strictEqual(removed, true);
    assert.ok(!existsSync(path));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runRemove: nonexistent guardrail returns false", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-remove-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const removed = runRemove("nonexistent-guardrail", dir);
    assert.strictEqual(removed, false);
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});
