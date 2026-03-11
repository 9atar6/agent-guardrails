import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";

const GUARDRAIL_RULE =
  "You MUST read and follow all constraints in .agents/guardrails/. Never violate a guardrail without explicit human approval.";

const GUARDRAIL_RULE_MARKER = "read and follow all constraints in .agents/guardrails";

export interface SetupResult {
  cursor: boolean;
  claude: boolean;
  message: string;
}

function removeRuleFromContent(content: string): string {
  const lines = content.split("\n").filter((line) => !line.includes(GUARDRAIL_RULE_MARKER));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function hasRule(content: string): boolean {
  return content.includes(GUARDRAIL_RULE_MARKER);
}

export function runSetup(projectPath: string = "."): SetupResult {
  const root = resolve(projectPath);
  let cursorDone = false;
  let claudeDone = false;

  // Cursor: .cursor/rules/agent-guardrails.md (preferred) or .cursorrules (legacy)
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
      cursorDone = true;
    }
  } else if (existsSync(cursorrulesPath)) {
    // Legacy: append to .cursorrules
    const existing = readFileSync(cursorrulesPath, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + "\n\n" + GUARDRAIL_RULE + "\n";
      writeFileSync(cursorrulesPath, appended);
      cursorDone = true;
    }
  } else {
    // Create .cursor/rules/agent-guardrails.md
    if (!existsSync(cursorRulesDir)) {
      mkdirSync(cursorRulesDir, { recursive: true });
    }
    writeFileSync(cursorRuleFile, cursorRuleContent);
    cursorDone = true;
  }

  // Claude Code: .claude/instructions.md
  const claudeDir = resolve(root, ".claude");
  const claudeInstructions = resolve(claudeDir, "instructions.md");

  if (existsSync(claudeInstructions)) {
    const existing = readFileSync(claudeInstructions, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + "\n\n" + GUARDRAIL_RULE + "\n";
      writeFileSync(claudeInstructions, appended);
      claudeDone = true;
    }
  } else {
    if (!existsSync(claudeDir)) {
      mkdirSync(claudeDir, { recursive: true });
    }
    writeFileSync(claudeInstructions, GUARDRAIL_RULE + "\n");
    claudeDone = true;
  }

  const messages: string[] = [];
  if (cursorDone) {
    messages.push(chalk.green("✓") + " Added guardrail rule for Cursor");
  }
  if (claudeDone) {
    messages.push(chalk.green("✓") + " Added guardrail rule for Claude Code");
  }
  if (messages.length === 0) {
    messages.push(chalk.yellow("Guardrail rule already present in all config files."));
  }

  return {
    cursor: cursorDone,
    claude: claudeDone,
    message: messages.join("\n"),
  };
}

export function runSetupRemove(projectPath: string = "."): SetupResult {
  const root = resolve(projectPath);
  let cursorDone = false;
  let claudeDone = false;

  const cursorRulesDir = resolve(root, ".cursor", "rules");
  const cursorRuleFile = resolve(cursorRulesDir, "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");
  const claudeInstructions = resolve(root, ".claude", "instructions.md");

  if (existsSync(cursorRuleFile)) {
    rmSync(cursorRuleFile);
    cursorDone = true;
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
      cursorDone = true;
    }
  }

  if (existsSync(claudeInstructions)) {
    const existing = readFileSync(claudeInstructions, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        writeFileSync(claudeInstructions, cleaned + "\n");
      } else {
        rmSync(claudeInstructions);
      }
      claudeDone = true;
    }
  }

  const messages: string[] = [];
  if (cursorDone) {
    messages.push(chalk.green("✓") + " Removed guardrail rule from Cursor");
  }
  if (claudeDone) {
    messages.push(chalk.green("✓") + " Removed guardrail rule from Claude Code");
  }
  if (messages.length === 0) {
    messages.push(chalk.yellow("Guardrail rule not found in any config files."));
  }

  return {
    cursor: cursorDone,
    claude: claudeDone,
    message: messages.join("\n"),
  };
}
