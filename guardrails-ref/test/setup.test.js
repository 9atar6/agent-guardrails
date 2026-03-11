import { test } from "node:test";
import assert from "node:assert";
import { join } from "path";
import { mkdtempSync, existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { runSetup, runSetupRemove, runSetupCheck } from "../dist/setup.js";

test("runSetup: creates Cursor rule and Claude instructions", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-test-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runSetup(dir);
    assert.ok(result.cursor || result.claude || result.copilot);
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

test("runSetup: creates Copilot instructions", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-copilot-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runSetup(dir);
    assert.ok(result.copilot);
    const copilotFile = join(dir, ".github", "copilot-instructions.md");
    assert.ok(existsSync(copilotFile));
    const content = readFileSync(copilotFile, "utf-8");
    assert.ok(content.includes("read and follow all constraints in .agents/guardrails"));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetup --ide copilot: only sets up Copilot", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-ide-copilot-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runSetup(dir, "copilot");
    assert.ok(result.copilot);
    assert.ok(!result.cursor && !result.claude);
    assert.ok(existsSync(join(dir, ".github", "copilot-instructions.md")));
    assert.ok(!existsSync(join(dir, ".cursor", "rules", "agent-guardrails.md")));
    assert.ok(!existsSync(join(dir, ".claude", "instructions.md")));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetupCheck: reports status correctly", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-check-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const before = runSetupCheck(dir);
    assert.ok(!before.cursor.configured && !before.claude.configured && !before.copilot.configured);

    runSetup(dir);
    const after = runSetupCheck(dir);
    assert.ok(after.cursor.configured && after.cursor.hasRule);
    assert.ok(after.claude.configured && after.claude.hasRule);
    assert.ok(after.copilot.configured && after.copilot.hasRule);
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
    assert.ok(result.cursor || result.claude || result.copilot);
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

test("runSetupRemove: removes Copilot instructions", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-remove-copilot-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    runSetup(dir, "copilot");
    const copilotFile = join(dir, ".github", "copilot-instructions.md");
    assert.ok(existsSync(copilotFile));

    const result = runSetupRemove(dir, "copilot");
    assert.ok(result.copilot);
    assert.ok(!existsSync(copilotFile));
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
    assert.ok(!result.cursor && !result.claude && !result.copilot);
    assert.ok(result.message.includes("not found") || result.message.includes("Guardrail"));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetup --dry-run: does not write files", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-dryrun-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    const result = runSetup(dir, undefined, true);
    assert.ok(result.message.includes("dry-run") || result.message.includes("already present"));
    assert.ok(!existsSync(join(dir, ".cursor", "rules", "agent-guardrails.md")));
    assert.ok(!existsSync(join(dir, ".claude", "instructions.md")));
    assert.ok(!existsSync(join(dir, ".github", "copilot-instructions.md")));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetup --ide auto: only sets up configured IDEs", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-ide-auto-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    // Pre-create only .claude/instructions.md so only Claude is "configured"
    const claudeDir = join(dir, ".claude");
    const claudeFile = join(claudeDir, "instructions.md");
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(claudeFile, "# My instructions\n");
    const checkBefore = runSetupCheck(dir);
    assert.ok(checkBefore.claude.configured && !checkBefore.claude.hasRule);
    assert.ok(!checkBefore.cursor.configured && !checkBefore.copilot.configured);

    const result = runSetup(dir, "auto");
    assert.ok(result.claude);
    assert.ok(!result.cursor && !result.copilot);
    const content = readFileSync(claudeFile, "utf-8");
    assert.ok(content.includes("read and follow all constraints in .agents/guardrails"));
    assert.ok(!existsSync(join(dir, ".cursor", "rules", "agent-guardrails.md")));
    assert.ok(!existsSync(join(dir, ".github", "copilot-instructions.md")));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runSetupRemove --dry-run: does not remove files", () => {
  const dir = mkdtempSync(join(tmpdir(), "guardrails-setup-remove-dryrun-"));
  const origLog = console.log;
  console.log = () => {};
  try {
    runSetup(dir);
    const cursorRule = join(dir, ".cursor", "rules", "agent-guardrails.md");
    assert.ok(existsSync(cursorRule));

    const result = runSetupRemove(dir, undefined, true);
    assert.ok(result.message.includes("dry-run") || result.message.includes("Would remove"));
    assert.ok(existsSync(cursorRule));
  } finally {
    console.log = origLog;
    rmSync(dir, { recursive: true, force: true });
  }
});
