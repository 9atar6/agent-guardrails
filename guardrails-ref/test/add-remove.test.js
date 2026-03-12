import { test } from "node:test";
import assert from "node:assert";
import { join, dirname } from "path";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { runAdd } from "../dist/add.js";
import { runRemove } from "../dist/remove.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cli = join(__dirname, "..", "dist", "cli.js");

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

test("runAdd: adds no-raw-sql and no-magic-numbers", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-add-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    for (const name of ["no-raw-sql", "no-magic-numbers"]) {
      const added = runAdd(name, dir);
      assert.strictEqual(added, true);
      const path = join(dir, ".agents", "guardrails", name, "GUARDRAIL.md");
      assert.ok(existsSync(path));
      const content = readFileSync(path, "utf-8");
      assert.ok(content.includes(`name: ${name}`));
    }
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runAdd: adds require-tests and no-inline-styles", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-add-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    for (const name of ["require-tests", "no-inline-styles"]) {
      const added = runAdd(name, dir);
      assert.strictEqual(added, true);
      const path = join(dir, ".agents", "guardrails", name, "GUARDRAIL.md");
      assert.ok(existsSync(path));
      const content = readFileSync(path, "utf-8");
      assert.ok(content.includes(`name: ${name}`));
    }
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runAdd: adds no-hardcoded-urls and no-sudo-commands", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-add-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    for (const name of ["no-hardcoded-urls", "no-sudo-commands"]) {
      const added = runAdd(name, dir);
      assert.strictEqual(added, true);
      const path = join(dir, ".agents", "guardrails", name, "GUARDRAIL.md");
      assert.ok(existsSync(path));
      const content = readFileSync(path, "utf-8");
      assert.ok(content.includes(`name: ${name}`));
    }
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("add CLI: bulk add multiple guardrails at once", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-bulk-add-"));
  const r = spawnSync("node", [cli, "add", "no-destructive-commands", "no-hardcoded-urls", "rate-limiting", dir], {
    encoding: "utf-8",
  });
  assert.strictEqual(r.status, 0);
  for (const name of ["no-destructive-commands", "no-hardcoded-urls", "rate-limiting"]) {
    const path = join(dir, ".agents", "guardrails", name, "GUARDRAIL.md");
    assert.ok(existsSync(path), `Expected ${name} to be added`);
  }
  rmSync(dir, { recursive: true, force: true });
});

test("add CLI: backward compat add name path", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-add-path-"));
  const r = spawnSync("node", [cli, "add", "no-plaintext-secrets", "."], {
    encoding: "utf-8",
    cwd: dir,
  });
  assert.strictEqual(r.status, 0);
  const path = join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md");
  assert.ok(existsSync(path));
  rmSync(dir, { recursive: true, force: true });
});

test("add CLI: multiple presets in one command", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-multi-preset-"));
  const r = spawnSync("node", [cli, "add", "--preset", "default,frontend", "--path", dir], {
    encoding: "utf-8",
  });
  assert.strictEqual(r.status, 0, "add --preset default,frontend should succeed");
  const defaultGuardrails = ["no-plaintext-secrets", "no-destructive-commands", "no-new-deps-without-approval", "require-commit-approval"];
  const frontendGuardrails = ["require-accessibility", "no-inline-styles", "no-hardcoded-user-facing-strings"];
  for (const name of [...defaultGuardrails, ...frontendGuardrails]) {
    const path = join(dir, ".agents", "guardrails", name, "GUARDRAIL.md");
    assert.ok(existsSync(path), `Expected ${name} from preset`);
  }
  rmSync(dir, { recursive: true, force: true });
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
