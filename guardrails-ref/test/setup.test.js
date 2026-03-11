import { test } from "node:test";
import assert from "node:assert";
import { join } from "path";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { runSetup, runSetupRemove } from "../dist/setup.js";

test("runSetup: creates Cursor rule and Claude instructions", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runSetup(dir);
    assert.ok(result.cursor || result.claude);
    const cursorRule = join(dir, ".cursor", "rules", "agent-guardrails.md");
    const claudeInstructions = join(dir, ".claude", "instructions.md");
    if (result.cursor) {
      assert.ok(existsSync(cursorRule) || existsSync(join(dir, ".cursorrules")));
      if (existsSync(cursorRule)) {
        const content = readFileSync(cursorRule, "utf-8");
        assert.ok(content.includes("read and follow all constraints in .agents/guardrails"));
      }
    }
    if (result.claude) {
      assert.ok(existsSync(claudeInstructions));
      const content = readFileSync(claudeInstructions, "utf-8");
      assert.ok(content.includes("read and follow all constraints in .agents/guardrails"));
    }
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetupRemove: removes Cursor rule and Claude instructions", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-remove-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    runSetup(dir);
    const cursorRule = join(dir, ".cursor", "rules", "agent-guardrails.md");
    const claudeInstructions = join(dir, ".claude", "instructions.md");
    assert.ok(existsSync(cursorRule) || existsSync(join(dir, ".cursorrules")));
    assert.ok(existsSync(claudeInstructions));

    const result = runSetupRemove(dir);
    assert.ok(result.cursor || result.claude);
    assert.ok(!existsSync(cursorRule));
    if (existsSync(join(dir, ".cursorrules"))) {
      const content = readFileSync(join(dir, ".cursorrules"), "utf-8");
      assert.ok(!content.includes("read and follow all constraints in .agents/guardrails"));
    }
    if (result.claude) {
      assert.ok(!existsSync(claudeInstructions));
    }
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetupRemove: no config returns message", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-remove-empty-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runSetupRemove(dir);
    assert.ok(!result.cursor && !result.claude);
    assert.ok(result.message.includes("not found") || result.message.includes("Guardrail"));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});
