import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";

const GUARDRAIL_RULE =
  "You MUST read and follow all constraints in .agents/guardrails/. Never violate a guardrail without explicit human approval.";

const GUARDRAIL_RULE_MARKER = "You MUST read and follow all constraints in .agents/guardrails";

export type IdeName = "cursor" | "claude" | "copilot";

export interface SetupResult {
  cursor: boolean;
  claude: boolean;
  copilot: boolean;
  message: string;
}

export interface SetupCheckResult {
  cursor: { configured: boolean; hasRule: boolean };
  claude: { configured: boolean; hasRule: boolean };
  copilot: { configured: boolean; hasRule: boolean };
}

/**
 * Removes the guardrail rule from file content.
 * When the resulting content is empty, the caller may delete the file (e.g. .cursorrules, .claude/instructions.md).
 */
function removeRuleFromContent(content: string): string {
  const lines = content.split("\n").filter((line) => !line.includes(GUARDRAIL_RULE_MARKER));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function hasRule(content: string): boolean {
  return content.includes(GUARDRAIL_RULE_MARKER);
}

function setupCursor(root: string): boolean {
  const cursorRulesDir = resolve(root, ".cursor", "rules");
  const cursorRuleFile = resolve(cursorRulesDir, "agent-guardrails.md");
  const cursorRuleContent = `---
description: Load and follow Agent Guardrails
alwaysApply: true
---

${GUARDRAIL_RULE}
`;

  const cursorrulesPath = resolve(root, ".cursorrules");

  if (existsSync(cursorRuleFile)) {
    const existing = readFileSync(cursorRuleFile, "utf-8");
    if (!hasRule(existing)) {
      writeFileSync(cursorRuleFile, cursorRuleContent);
      return true;
    }
  } else if (existsSync(cursorrulesPath)) {
    const existing = readFileSync(cursorrulesPath, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + "\n\n" + GUARDRAIL_RULE + "\n";
      writeFileSync(cursorrulesPath, appended);
      return true;
    }
  } else {
    if (!existsSync(cursorRulesDir)) {
      mkdirSync(cursorRulesDir, { recursive: true });
    }
    writeFileSync(cursorRuleFile, cursorRuleContent);
    return true;
  }
  return false;
}

function setupClaude(root: string): boolean {
  const claudeDir = resolve(root, ".claude");
  const claudeInstructions = resolve(claudeDir, "instructions.md");

  if (existsSync(claudeInstructions)) {
    const existing = readFileSync(claudeInstructions, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + "\n\n" + GUARDRAIL_RULE + "\n";
      writeFileSync(claudeInstructions, appended);
      return true;
    }
  } else {
    if (!existsSync(claudeDir)) {
      mkdirSync(claudeDir, { recursive: true });
    }
    writeFileSync(claudeInstructions, GUARDRAIL_RULE + "\n");
    return true;
  }
  return false;
}

function setupCopilot(root: string): boolean {
  const githubDir = resolve(root, ".github");
  const copilotFile = resolve(githubDir, "copilot-instructions.md");

  const ruleBlock = `\n\n${GUARDRAIL_RULE}\n`;

  if (existsSync(copilotFile)) {
    const existing = readFileSync(copilotFile, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + ruleBlock;
      writeFileSync(copilotFile, appended);
      return true;
    }
  } else {
    if (!existsSync(githubDir)) {
      mkdirSync(githubDir, { recursive: true });
    }
    writeFileSync(copilotFile, GUARDRAIL_RULE + "\n");
    return true;
  }
  return false;
}

function removeCursor(root: string): boolean {
  const cursorRulesDir = resolve(root, ".cursor", "rules");
  const cursorRuleFile = resolve(cursorRulesDir, "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");

  let done = false;
  if (existsSync(cursorRuleFile)) {
    rmSync(cursorRuleFile);
    done = true;
  }

  if (existsSync(cursorrulesPath)) {
    const existing = readFileSync(cursorrulesPath, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        writeFileSync(cursorrulesPath, cleaned + "\n");
      } else {
        rmSync(cursorrulesPath);
      }
      done = true;
    }
  }
  return done;
}

function removeClaude(root: string): boolean {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");

  if (existsSync(claudeInstructions)) {
    const existing = readFileSync(claudeInstructions, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        writeFileSync(claudeInstructions, cleaned + "\n");
      } else {
        rmSync(claudeInstructions);
      }
      return true;
    }
  }
  return false;
}

function removeCopilot(root: string): boolean {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");

  if (existsSync(copilotFile)) {
    const existing = readFileSync(copilotFile, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        writeFileSync(copilotFile, cleaned + "\n");
      } else {
        rmSync(copilotFile);
      }
      return true;
    }
  }
  return false;
}

function checkCursor(root: string): { configured: boolean; hasRule: boolean } {
  const cursorRuleFile = resolve(root, ".cursor", "rules", "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");

  if (existsSync(cursorRuleFile)) {
    const content = readFileSync(cursorRuleFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  if (existsSync(cursorrulesPath)) {
    const content = readFileSync(cursorrulesPath, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkClaude(root: string): { configured: boolean; hasRule: boolean } {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");

  if (existsSync(claudeInstructions)) {
    const content = readFileSync(claudeInstructions, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkCopilot(root: string): { configured: boolean; hasRule: boolean } {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");

  if (existsSync(copilotFile)) {
    const content = readFileSync(copilotFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

/**
 * Check which IDEs are configured and whether they have the guardrail rule.
 */
export function runSetupCheck(projectPath: string = "."): SetupCheckResult {
  const root = resolve(projectPath);
  return {
    cursor: checkCursor(root),
    claude: checkClaude(root),
    copilot: checkCopilot(root),
  };
}

function wouldSetupCursor(root: string): boolean {
  const cursorRuleFile = resolve(root, ".cursor", "rules", "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");
  if (existsSync(cursorRuleFile)) return !hasRule(readFileSync(cursorRuleFile, "utf-8"));
  if (existsSync(cursorrulesPath)) return !hasRule(readFileSync(cursorrulesPath, "utf-8"));
  return true;
}

function wouldSetupClaude(root: string): boolean {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");
  if (existsSync(claudeInstructions)) return !hasRule(readFileSync(claudeInstructions, "utf-8"));
  return true;
}

function wouldSetupCopilot(root: string): boolean {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");
  if (existsSync(copilotFile)) return !hasRule(readFileSync(copilotFile, "utf-8"));
  return true;
}

function wouldRemoveCursor(root: string): boolean {
  const cursorRuleFile = resolve(root, ".cursor", "rules", "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");
  if (existsSync(cursorRuleFile)) return true;
  if (existsSync(cursorrulesPath)) return hasRule(readFileSync(cursorrulesPath, "utf-8"));
  return false;
}

function wouldRemoveClaude(root: string): boolean {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");
  return existsSync(claudeInstructions) && hasRule(readFileSync(claudeInstructions, "utf-8"));
}

function wouldRemoveCopilot(root: string): boolean {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");
  return existsSync(copilotFile) && hasRule(readFileSync(copilotFile, "utf-8"));
}

export function runSetup(
  projectPath: string = ".",
  ideFilter?: IdeName | "all" | "auto",
  dryRun = false
): SetupResult {
  const root = resolve(projectPath);
  let ides: IdeName[];

  if (ideFilter === "auto") {
    const check = runSetupCheck(root);
    ides = (["cursor", "claude", "copilot"] as IdeName[]).filter(
      (ide) => check[ide as keyof SetupCheckResult].configured
    );
  } else if (ideFilter && ideFilter !== "all") {
    ides = [ideFilter as IdeName];
  } else {
    ides = ["cursor", "claude", "copilot"] as IdeName[];
  }

  let cursorDone = false;
  let claudeDone = false;
  let copilotDone = false;

  if (dryRun) {
    if (ides.includes("cursor")) cursorDone = wouldSetupCursor(root);
    if (ides.includes("claude")) claudeDone = wouldSetupClaude(root);
    if (ides.includes("copilot")) copilotDone = wouldSetupCopilot(root);
    const messages: string[] = [];
    if (cursorDone) messages.push(chalk.gray("[dry-run] Would add guardrail rule for Cursor"));
    if (claudeDone) messages.push(chalk.gray("[dry-run] Would add guardrail rule for Claude Code"));
    if (copilotDone) messages.push(chalk.gray("[dry-run] Would add guardrail rule for VS Code Copilot"));
    if (messages.length === 0) {
      messages.push(chalk.yellow("Guardrail rule already present in all target IDEs. Nothing to do."));
    }
    return { cursor: cursorDone, claude: claudeDone, copilot: copilotDone, message: messages.join("\n") };
  }

  if (ides.includes("cursor")) cursorDone = setupCursor(root);
  if (ides.includes("claude")) claudeDone = setupClaude(root);
  if (ides.includes("copilot")) copilotDone = setupCopilot(root);

  const messages: string[] = [];
  if (cursorDone) messages.push(chalk.green("✓") + " Added guardrail rule for Cursor");
  if (claudeDone) messages.push(chalk.green("✓") + " Added guardrail rule for Claude Code");
  if (copilotDone) messages.push(chalk.green("✓") + " Added guardrail rule for VS Code Copilot");

  if (messages.length === 0) {
    messages.push(chalk.yellow("Guardrail rule already present in all configured IDEs."));
  }

  return {
    cursor: cursorDone,
    claude: claudeDone,
    copilot: copilotDone,
    message: messages.join("\n"),
  };
}

export function runSetupRemove(
  projectPath: string = ".",
  ideFilter?: IdeName | "all" | "auto",
  dryRun = false
): SetupResult {
  const root = resolve(projectPath);
  let ides: IdeName[];

  if (ideFilter === "auto") {
    const check = runSetupCheck(root);
    ides = (["cursor", "claude", "copilot"] as IdeName[]).filter(
      (ide) => check[ide as keyof SetupCheckResult].hasRule
    );
  } else if (ideFilter && ideFilter !== "all") {
    ides = [ideFilter as IdeName];
  } else {
    ides = ["cursor", "claude", "copilot"] as IdeName[];
  }

  let cursorDone = false;
  let claudeDone = false;
  let copilotDone = false;

  if (dryRun) {
    if (ides.includes("cursor")) cursorDone = wouldRemoveCursor(root);
    if (ides.includes("claude")) claudeDone = wouldRemoveClaude(root);
    if (ides.includes("copilot")) copilotDone = wouldRemoveCopilot(root);
    const messages: string[] = [];
    if (cursorDone) messages.push(chalk.gray("[dry-run] Would remove guardrail rule from Cursor"));
    if (claudeDone) messages.push(chalk.gray("[dry-run] Would remove guardrail rule from Claude Code"));
    if (copilotDone) messages.push(chalk.gray("[dry-run] Would remove guardrail rule from VS Code Copilot"));
    if (messages.length === 0) {
      messages.push(chalk.yellow("Guardrail rule not found in any config files. Nothing to do."));
    }
    return { cursor: cursorDone, claude: claudeDone, copilot: copilotDone, message: messages.join("\n") };
  }

  if (ides.includes("cursor")) cursorDone = removeCursor(root);
  if (ides.includes("claude")) claudeDone = removeClaude(root);
  if (ides.includes("copilot")) copilotDone = removeCopilot(root);

  const messages: string[] = [];
  if (cursorDone) messages.push(chalk.green("✓") + " Removed guardrail rule from Cursor");
  if (claudeDone) messages.push(chalk.green("✓") + " Removed guardrail rule from Claude Code");
  if (copilotDone) messages.push(chalk.green("✓") + " Removed guardrail rule from VS Code Copilot");

  if (messages.length === 0) {
    messages.push(chalk.yellow("Guardrail rule not found in any config files."));
  }

  return {
    cursor: cursorDone,
    claude: claudeDone,
    copilot: copilotDone,
    message: messages.join("\n"),
  };
}
