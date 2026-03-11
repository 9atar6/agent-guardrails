/**
 * End-to-end test: runs full CLI workflow in a temp folder.
 * Verifies init, add (single + bulk), validate, check, list, upgrade, remove.
 */
import { test } from "node:test";
import assert from "node:assert";
import { join, dirname } from "path";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cli = join(__dirname, "..", "dist", "cli.js");

function run(args, cwd) {
  return spawnSync("node", [cli, ...args], { encoding: "utf-8", cwd });
}

test("e2e: full workflow in test folder", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-e2e-"));
  try {
    // 1. init
    const r1 = run(["init", dir]);
    assert.strictEqual(r1.status, 0, "init should succeed");
    assert.ok(existsSync(join(dir, ".agents", "guardrails", "no-plaintext-secrets", "GUARDRAIL.md")));
    assert.ok(existsSync(join(dir, ".cursor", "rules", "agent-guardrails.md")));

    // 2. add (bulk)
    const r2 = run(["add", "no-destructive-commands", "no-hardcoded-urls", "rate-limiting", dir]);
    assert.strictEqual(r2.status, 0, "add bulk should succeed");
    for (const name of ["no-destructive-commands", "no-hardcoded-urls", "rate-limiting"]) {
      assert.ok(existsSync(join(dir, ".agents", "guardrails", name, "GUARDRAIL.md")), name);
    }

    // 3. validate
    const r3 = run(["validate", dir]);
    assert.strictEqual(r3.status, 0, "validate should succeed");
    assert.ok(r3.stdout.includes("Valid:"));

    // 4. check --strict
    const r4 = run(["check", dir, "--strict"]);
    assert.strictEqual(r4.status, 0, "check --strict should succeed");
    assert.ok(r4.stdout.includes("OK"));

    // 5. list
    const r5 = run(["list", dir]);
    assert.strictEqual(r5.status, 0, "list should succeed");
    assert.ok(r5.stdout.includes("no-plaintext-secrets"));
    assert.ok(r5.stdout.includes("no-destructive-commands"));

    // 6. upgrade --dry-run (no changes expected if templates match)
    const r6 = run(["upgrade", dir, "--dry-run"]);
    assert.strictEqual(r6.status, 0, "upgrade --dry-run should succeed");

    // 7. remove
    const r7 = run(["remove", "rate-limiting", dir]);
    assert.strictEqual(r7.status, 0, "remove should succeed");
    assert.ok(!existsSync(join(dir, ".agents", "guardrails", "rate-limiting")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
