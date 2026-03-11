import { test } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cli = join(__dirname, "..", "dist", "cli.js");
const examplesDir = join(__dirname, "..", "..", "examples");

test("list: exits 1 when no guardrails found (CI-friendly)", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-list-empty-"));
  try {
    const r = spawnSync("node", [cli, "list", dir], { encoding: "utf-8" });
    assert.strictEqual(r.status, 1);
    assert.ok(r.stdout.includes("No guardrails found"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check: valid examples prints OK and exits 0", () => {
  const r = spawnSync("node", [cli, "check", examplesDir], { encoding: "utf-8" });
  assert.strictEqual(r.status, 0);
  assert.ok(r.stdout.includes("OK"));
});

test("check: --strict prints OK when no warnings", () => {
  const r = spawnSync("node", [cli, "check", examplesDir, "--strict"], { encoding: "utf-8" });
  assert.strictEqual(r.status, 0);
  assert.ok(r.stdout.includes("OK"));
});
