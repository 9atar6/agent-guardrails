import { test } from "node:test";
import assert from "node:assert";
import { join } from "path";
import { mkdtempSync, existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { runAdd } from "../dist/add.js";
import { runUpgrade } from "../dist/upgrade.js";

test("runUpgrade: updates outdated guardrail", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-upgrade-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    runAdd("no-plaintext-secrets", dir);
    const path = join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md");
    const before = readFileSync(path, "utf-8");
    // Corrupt the file slightly
    const corrupted = before.replace("Never store", "Never ever store");
    writeFileSync(path, corrupted);
    const result = runUpgrade(dir, false);
    assert.ok(result.updated.includes("no-plaintext-secrets"));
    const after = readFileSync(path, "utf-8");
    assert.ok(after.includes("Never store"));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runUpgrade: dry-run does not write", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-upgrade-dryrun-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    runAdd("no-plaintext-secrets", dir);
    const path = join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md");
    const corrupted = readFileSync(path, "utf-8").replace("Never store", "Never ever store");
    writeFileSync(path, corrupted);
    const result = runUpgrade(dir, true);
    assert.ok(result.updated.includes("no-plaintext-secrets"));
    const after = readFileSync(path, "utf-8");
    assert.ok(after.includes("Never ever store"));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});
