import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { debugLog } from "./debug.js";

const GUARDRAIL_RULE =
  "You MUST read and follow all constraints in .agents/guardrails/. Never violate a guardrail without explicit human approval.";

const GUARDRAIL_RULE_MARKER = "You MUST read and follow all constraints in .agents/guardrails";

export type IdeName =
  | "cursor"
  | "claude"
  | "copilot"
  | "windsurf"
  | "continue"
  | "jetbrains"
  | "junie";

export interface SetupResult {
  cursor: boolean;
  claude: boolean;
  copilot: boolean;
  windsurf: boolean;
  continue: boolean;
  jetbrains: boolean;
  junie: boolean;
  message: string;
}

export interface SetupCheckResult {
  cursor: { configured: boolean; hasRule: boolean };
  claude: { configured: boolean; hasRule: boolean };
  copilot: { configured: boolean; hasRule: boolean };
  windsurf: { configured: boolean; hasRule: boolean };
  continue: { configured: boolean; hasRule: boolean };
  jetbrains: { configured: boolean; hasRule: boolean };
  junie: { configured: boolean; hasRule: boolean };
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
    debugLog("read", cursorRuleFile);
    const existing = readFileSync(cursorRuleFile, "utf-8");
    if (!hasRule(existing)) {
      debugLog("write", cursorRuleFile);
      writeFileSync(cursorRuleFile, cursorRuleContent);
      return true;
    }
  } else if (existsSync(cursorrulesPath)) {
    debugLog("read", cursorrulesPath);
    const existing = readFileSync(cursorrulesPath, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + "\n\n" + GUARDRAIL_RULE + "\n";
      debugLog("write", cursorrulesPath);
      writeFileSync(cursorrulesPath, appended);
      return true;
    }
  } else {
    if (!existsSync(cursorRulesDir)) {
      debugLog("write", cursorRulesDir);
      mkdirSync(cursorRulesDir, { recursive: true });
    }
    debugLog("write", cursorRuleFile);
    writeFileSync(cursorRuleFile, cursorRuleContent);
    return true;
  }
  return false;
}

function setupClaude(root: string): boolean {
  const claudeDir = resolve(root, ".claude");
  const claudeInstructions = resolve(claudeDir, "instructions.md");

  if (existsSync(claudeInstructions)) {
    debugLog("read", claudeInstructions);
    const existing = readFileSync(claudeInstructions, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + "\n\n" + GUARDRAIL_RULE + "\n";
      debugLog("write", claudeInstructions);
      writeFileSync(claudeInstructions, appended);
      return true;
    }
  } else {
    if (!existsSync(claudeDir)) {
      debugLog("write", claudeDir);
      mkdirSync(claudeDir, { recursive: true });
    }
    debugLog("write", claudeInstructions);
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
    debugLog("read", copilotFile);
    const existing = readFileSync(copilotFile, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + ruleBlock;
      debugLog("write", copilotFile);
      writeFileSync(copilotFile, appended);
      return true;
    }
  } else {
    if (!existsSync(githubDir)) {
      debugLog("write", githubDir);
      mkdirSync(githubDir, { recursive: true });
    }
    debugLog("write", copilotFile);
    writeFileSync(copilotFile, GUARDRAIL_RULE + "\n");
    return true;
  }
  return false;
}

function setupWindsurf(root: string): boolean {
  const windsurfFile = resolve(root, ".windsurfrules");
  const ruleBlock = `\n\n${GUARDRAIL_RULE}\n`;

  if (existsSync(windsurfFile)) {
    debugLog("read", windsurfFile);
    const existing = readFileSync(windsurfFile, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + ruleBlock;
      debugLog("write", windsurfFile);
      writeFileSync(windsurfFile, appended);
      return true;
    }
  } else {
    debugLog("write", windsurfFile);
    writeFileSync(windsurfFile, GUARDRAIL_RULE + "\n");
    return true;
  }
  return false;
}

function setupContinue(root: string): boolean {
  const continueRulesDir = resolve(root, ".continue", "rules");
  const continueRuleFile = resolve(continueRulesDir, "agent-guardrails.md");
  const continueRuleContent = `# Agent Guardrails\n\n${GUARDRAIL_RULE}\n`;

  if (existsSync(continueRuleFile)) {
    debugLog("read", continueRuleFile);
    const existing = readFileSync(continueRuleFile, "utf-8");
    if (!hasRule(existing)) {
      debugLog("write", continueRuleFile);
      writeFileSync(continueRuleFile, continueRuleContent);
      return true;
    }
  } else {
    if (!existsSync(continueRulesDir)) {
      debugLog("write", continueRulesDir);
      mkdirSync(continueRulesDir, { recursive: true });
    }
    debugLog("write", continueRuleFile);
    writeFileSync(continueRuleFile, continueRuleContent);
    return true;
  }
  return false;
}

function setupJetbrains(root: string): boolean {
  const jetbrainsRulesDir = resolve(root, ".aiassistant", "rules");
  const jetbrainsRuleFile = resolve(jetbrainsRulesDir, "agent-guardrails.md");
  const jetbrainsRuleContent = `# Agent Guardrails\n\n${GUARDRAIL_RULE}\n`;

  if (existsSync(jetbrainsRuleFile)) {
    debugLog("read", jetbrainsRuleFile);
    const existing = readFileSync(jetbrainsRuleFile, "utf-8");
    if (!hasRule(existing)) {
      debugLog("write", jetbrainsRuleFile);
      writeFileSync(jetbrainsRuleFile, jetbrainsRuleContent);
      return true;
    }
  } else {
    if (!existsSync(jetbrainsRulesDir)) {
      debugLog("write", jetbrainsRulesDir);
      mkdirSync(jetbrainsRulesDir, { recursive: true });
    }
    debugLog("write", jetbrainsRuleFile);
    writeFileSync(jetbrainsRuleFile, jetbrainsRuleContent);
    return true;
  }
  return false;
}

function setupJunie(root: string): boolean {
  const junieDir = resolve(root, ".junie");
  const junieFile = resolve(junieDir, "guidelines.md");
  const ruleBlock = `\n\n${GUARDRAIL_RULE}\n`;

  if (existsSync(junieFile)) {
    debugLog("read", junieFile);
    const existing = readFileSync(junieFile, "utf-8");
    if (!hasRule(existing)) {
      const appended = existing.trimEnd() + ruleBlock;
      debugLog("write", junieFile);
      writeFileSync(junieFile, appended);
      return true;
    }
  } else {
    if (!existsSync(junieDir)) {
      debugLog("write", junieDir);
      mkdirSync(junieDir, { recursive: true });
    }
    debugLog("write", junieFile);
    writeFileSync(junieFile, GUARDRAIL_RULE + "\n");
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
    debugLog("write", cursorRuleFile);
    rmSync(cursorRuleFile);
    done = true;
  }

  if (existsSync(cursorrulesPath)) {
    debugLog("read", cursorrulesPath);
    const existing = readFileSync(cursorrulesPath, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        debugLog("write", cursorrulesPath);
        writeFileSync(cursorrulesPath, cleaned + "\n");
      } else {
        debugLog("write", cursorrulesPath);
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
    debugLog("read", claudeInstructions);
    const existing = readFileSync(claudeInstructions, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        debugLog("write", claudeInstructions);
        writeFileSync(claudeInstructions, cleaned + "\n");
      } else {
        debugLog("write", claudeInstructions);
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
    debugLog("read", copilotFile);
    const existing = readFileSync(copilotFile, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        debugLog("write", copilotFile);
        writeFileSync(copilotFile, cleaned + "\n");
      } else {
        debugLog("write", copilotFile);
        rmSync(copilotFile);
      }
      return true;
    }
  }
  return false;
}

function removeWindsurf(root: string): boolean {
  const windsurfFile = resolve(root, ".windsurfrules");

  if (existsSync(windsurfFile)) {
    debugLog("read", windsurfFile);
    const existing = readFileSync(windsurfFile, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        debugLog("write", windsurfFile);
        writeFileSync(windsurfFile, cleaned + "\n");
      } else {
        debugLog("write", windsurfFile);
        rmSync(windsurfFile);
      }
      return true;
    }
  }
  return false;
}

function removeContinue(root: string): boolean {
  const continueRuleFile = resolve(root, ".continue", "rules", "agent-guardrails.md");

  if (existsSync(continueRuleFile)) {
    debugLog("write", continueRuleFile);
    rmSync(continueRuleFile);
    return true;
  }
  return false;
}

function removeJetbrains(root: string): boolean {
  const jetbrainsRuleFile = resolve(root, ".aiassistant", "rules", "agent-guardrails.md");

  if (existsSync(jetbrainsRuleFile)) {
    debugLog("write", jetbrainsRuleFile);
    rmSync(jetbrainsRuleFile);
    return true;
  }
  return false;
}

function removeJunie(root: string): boolean {
  const junieFile = resolve(root, ".junie", "guidelines.md");

  if (existsSync(junieFile)) {
    debugLog("read", junieFile);
    const existing = readFileSync(junieFile, "utf-8");
    if (hasRule(existing)) {
      const cleaned = removeRuleFromContent(existing);
      if (cleaned) {
        debugLog("write", junieFile);
        writeFileSync(junieFile, cleaned + "\n");
      } else {
        debugLog("write", junieFile);
        rmSync(junieFile);
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
    debugLog("read", cursorRuleFile);
    const content = readFileSync(cursorRuleFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  if (existsSync(cursorrulesPath)) {
    debugLog("read", cursorrulesPath);
    const content = readFileSync(cursorrulesPath, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkClaude(root: string): { configured: boolean; hasRule: boolean } {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");

  if (existsSync(claudeInstructions)) {
    debugLog("read", claudeInstructions);
    const content = readFileSync(claudeInstructions, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkCopilot(root: string): { configured: boolean; hasRule: boolean } {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");

  if (existsSync(copilotFile)) {
    debugLog("read", copilotFile);
    const content = readFileSync(copilotFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkWindsurf(root: string): { configured: boolean; hasRule: boolean } {
  const windsurfFile = resolve(root, ".windsurfrules");

  if (existsSync(windsurfFile)) {
    debugLog("read", windsurfFile);
    const content = readFileSync(windsurfFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkContinue(root: string): { configured: boolean; hasRule: boolean } {
  const continueRuleFile = resolve(root, ".continue", "rules", "agent-guardrails.md");

  if (existsSync(continueRuleFile)) {
    debugLog("read", continueRuleFile);
    const content = readFileSync(continueRuleFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkJetbrains(root: string): { configured: boolean; hasRule: boolean } {
  const jetbrainsRuleFile = resolve(root, ".aiassistant", "rules", "agent-guardrails.md");

  if (existsSync(jetbrainsRuleFile)) {
    debugLog("read", jetbrainsRuleFile);
    const content = readFileSync(jetbrainsRuleFile, "utf-8");
    return { configured: true, hasRule: hasRule(content) };
  }
  return { configured: false, hasRule: false };
}

function checkJunie(root: string): { configured: boolean; hasRule: boolean } {
  const junieFile = resolve(root, ".junie", "guidelines.md");

  if (existsSync(junieFile)) {
    debugLog("read", junieFile);
    const content = readFileSync(junieFile, "utf-8");
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
    windsurf: checkWindsurf(root),
    continue: checkContinue(root),
    jetbrains: checkJetbrains(root),
    junie: checkJunie(root),
  };
}

function wouldSetupCursor(root: string): boolean {
  const cursorRuleFile = resolve(root, ".cursor", "rules", "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");
  if (existsSync(cursorRuleFile)) {
    debugLog("read", cursorRuleFile);
    return !hasRule(readFileSync(cursorRuleFile, "utf-8"));
  }
  if (existsSync(cursorrulesPath)) {
    debugLog("read", cursorrulesPath);
    return !hasRule(readFileSync(cursorrulesPath, "utf-8"));
  }
  return true;
}

function wouldSetupClaude(root: string): boolean {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");
  if (existsSync(claudeInstructions)) {
    debugLog("read", claudeInstructions);
    return !hasRule(readFileSync(claudeInstructions, "utf-8"));
  }
  return true;
}

function wouldSetupCopilot(root: string): boolean {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");
  if (existsSync(copilotFile)) {
    debugLog("read", copilotFile);
    return !hasRule(readFileSync(copilotFile, "utf-8"));
  }
  return true;
}

function wouldRemoveCursor(root: string): boolean {
  const cursorRuleFile = resolve(root, ".cursor", "rules", "agent-guardrails.md");
  const cursorrulesPath = resolve(root, ".cursorrules");
  if (existsSync(cursorRuleFile)) return true;
  if (existsSync(cursorrulesPath)) {
    debugLog("read", cursorrulesPath);
    return hasRule(readFileSync(cursorrulesPath, "utf-8"));
  }
  return false;
}

function wouldRemoveClaude(root: string): boolean {
  const claudeInstructions = resolve(root, ".claude", "instructions.md");
  if (existsSync(claudeInstructions)) {
    debugLog("read", claudeInstructions);
    return hasRule(readFileSync(claudeInstructions, "utf-8"));
  }
  return false;
}

function wouldRemoveCopilot(root: string): boolean {
  const copilotFile = resolve(root, ".github", "copilot-instructions.md");
  if (existsSync(copilotFile)) {
    debugLog("read", copilotFile);
    return hasRule(readFileSync(copilotFile, "utf-8"));
  }
  return false;
}

function wouldSetupWindsurf(root: string): boolean {
  const windsurfFile = resolve(root, ".windsurfrules");
  if (existsSync(windsurfFile)) {
    debugLog("read", windsurfFile);
    return !hasRule(readFileSync(windsurfFile, "utf-8"));
  }
  return true;
}

function wouldSetupContinue(root: string): boolean {
  const continueRuleFile = resolve(root, ".continue", "rules", "agent-guardrails.md");
  if (existsSync(continueRuleFile)) {
    debugLog("read", continueRuleFile);
    return !hasRule(readFileSync(continueRuleFile, "utf-8"));
  }
  return true;
}

function wouldSetupJetbrains(root: string): boolean {
  const jetbrainsRuleFile = resolve(root, ".aiassistant", "rules", "agent-guardrails.md");
  if (existsSync(jetbrainsRuleFile)) {
    debugLog("read", jetbrainsRuleFile);
    return !hasRule(readFileSync(jetbrainsRuleFile, "utf-8"));
  }
  return true;
}

function wouldSetupJunie(root: string): boolean {
  const junieFile = resolve(root, ".junie", "guidelines.md");
  if (existsSync(junieFile)) {
    debugLog("read", junieFile);
    return !hasRule(readFileSync(junieFile, "utf-8"));
  }
  return true;
}

function wouldRemoveWindsurf(root: string): boolean {
  const windsurfFile = resolve(root, ".windsurfrules");
  if (existsSync(windsurfFile)) {
    debugLog("read", windsurfFile);
    return hasRule(readFileSync(windsurfFile, "utf-8"));
  }
  return false;
}

function wouldRemoveContinue(root: string): boolean {
  return existsSync(resolve(root, ".continue", "rules", "agent-guardrails.md"));
}

function wouldRemoveJetbrains(root: string): boolean {
  return existsSync(resolve(root, ".aiassistant", "rules", "agent-guardrails.md"));
}

function wouldRemoveJunie(root: string): boolean {
  const junieFile = resolve(root, ".junie", "guidelines.md");
  if (existsSync(junieFile)) {
    debugLog("read", junieFile);
    return hasRule(readFileSync(junieFile, "utf-8"));
  }
  return false;
}

const ALL_IDES: IdeName[] = [
  "cursor",
  "claude",
  "copilot",
  "windsurf",
  "continue",
  "jetbrains",
  "junie",
];

const IDE_LABELS: Record<IdeName, string> = {
  cursor: "Cursor",
  claude: "Claude Code",
  copilot: "VS Code Copilot",
  windsurf: "Windsurf",
  continue: "Continue",
  jetbrains: "JetBrains AI Assistant",
  junie: "JetBrains Junie",
};

export function runSetup(
  projectPath: string = ".",
  ideFilter?: IdeName | "all" | "auto",
  dryRun = false
): SetupResult {
  const root = resolve(projectPath);
  let ides: IdeName[];

  if (ideFilter === "auto") {
    const check = runSetupCheck(root);
    ides = ALL_IDES.filter((ide) => check[ide].configured);
  } else if (ideFilter && ideFilter !== "all") {
    ides = [ideFilter as IdeName];
  } else {
    ides = [...ALL_IDES];
  }

  const setupFns: Record<IdeName, (r: string) => boolean> = {
    cursor: setupCursor,
    claude: setupClaude,
    copilot: setupCopilot,
    windsurf: setupWindsurf,
    continue: setupContinue,
    jetbrains: setupJetbrains,
    junie: setupJunie,
  };

  const wouldSetupFns: Record<IdeName, (r: string) => boolean> = {
    cursor: wouldSetupCursor,
    claude: wouldSetupClaude,
    copilot: wouldSetupCopilot,
    windsurf: wouldSetupWindsurf,
    continue: wouldSetupContinue,
    jetbrains: wouldSetupJetbrains,
    junie: wouldSetupJunie,
  };

  const result: Record<IdeName, boolean> = {
    cursor: false,
    claude: false,
    copilot: false,
    windsurf: false,
    continue: false,
    jetbrains: false,
    junie: false,
  };

  for (const ide of ides) {
    result[ide] = dryRun ? wouldSetupFns[ide](root) : setupFns[ide](root);
  }

  const messages: string[] = [];
  for (const ide of ides) {
    if (result[ide]) {
      messages.push(
        dryRun
          ? chalk.gray("[dry-run] Would add guardrail rule for " + IDE_LABELS[ide])
          : chalk.green("✓") + " Added guardrail rule for " + IDE_LABELS[ide]
      );
    }
  }
  if (messages.length === 0) {
    messages.push(
      chalk.yellow(
        dryRun
          ? "Guardrail rule already present in all target IDEs. Nothing to do."
          : "Guardrail rule already present in all configured IDEs."
      )
    );
  }

  return {
    ...result,
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
    ides = ALL_IDES.filter((ide) => check[ide].hasRule);
  } else if (ideFilter && ideFilter !== "all") {
    ides = [ideFilter as IdeName];
  } else {
    ides = [...ALL_IDES];
  }

  const removeFns: Record<IdeName, (r: string) => boolean> = {
    cursor: removeCursor,
    claude: removeClaude,
    copilot: removeCopilot,
    windsurf: removeWindsurf,
    continue: removeContinue,
    jetbrains: removeJetbrains,
    junie: removeJunie,
  };

  const wouldRemoveFns: Record<IdeName, (r: string) => boolean> = {
    cursor: wouldRemoveCursor,
    claude: wouldRemoveClaude,
    copilot: wouldRemoveCopilot,
    windsurf: wouldRemoveWindsurf,
    continue: wouldRemoveContinue,
    jetbrains: wouldRemoveJetbrains,
    junie: wouldRemoveJunie,
  };

  const result: Record<IdeName, boolean> = {
    cursor: false,
    claude: false,
    copilot: false,
    windsurf: false,
    continue: false,
    jetbrains: false,
    junie: false,
  };

  for (const ide of ides) {
    result[ide] = dryRun ? wouldRemoveFns[ide](root) : removeFns[ide](root);
  }

  const messages: string[] = [];
  for (const ide of ides) {
    if (result[ide]) {
      messages.push(
        dryRun
          ? chalk.gray("[dry-run] Would remove guardrail rule from " + IDE_LABELS[ide])
          : chalk.green("✓") + " Removed guardrail rule from " + IDE_LABELS[ide]
      );
    }
  }
  if (messages.length === 0) {
    messages.push(chalk.yellow("Guardrail rule not found in any config files."));
  }

  return {
    ...result,
    message: messages.join("\n"),
  };
}
