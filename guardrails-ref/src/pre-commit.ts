import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { debugLog } from "./debug.js";

const GUARDRAILS_CHECK = "npx guardrails-ref check . --strict";
const GUARDRAILS_CHECK_MARKER = "guardrails-ref check";

export interface PreCommitResult {
  done: boolean;
  message: string;
}

function addToHuskyPreCommit(root: string): boolean {
  const huskyDir = resolve(root, ".husky");
  const preCommitFile = resolve(huskyDir, "pre-commit");

  const line = GUARDRAILS_CHECK + "\n";

  if (existsSync(preCommitFile)) {
    debugLog("read", preCommitFile);
    const content = readFileSync(preCommitFile, "utf-8");
    if (content.includes(GUARDRAILS_CHECK_MARKER)) return false;
    const appended = content.trimEnd().endsWith("\n") ? content + line : content + "\n" + line;
    debugLog("write", preCommitFile);
    writeFileSync(preCommitFile, appended);
    return true;
  }

  if (!existsSync(huskyDir)) {
    debugLog("write", huskyDir);
    mkdirSync(huskyDir, { recursive: true });
  }
  const shebang = "#!/bin/sh\n";
  debugLog("write", preCommitFile);
  writeFileSync(preCommitFile, shebang + line);
  return true;
}

function removeFromHuskyPreCommit(root: string): boolean {
  const preCommitFile = resolve(root, ".husky", "pre-commit");
  if (!existsSync(preCommitFile)) return false;

  debugLog("read", preCommitFile);
  const content = readFileSync(preCommitFile, "utf-8");
  if (!content.includes(GUARDRAILS_CHECK_MARKER)) return false;

  const lines = content.split("\n").filter((l) => !l.includes(GUARDRAILS_CHECK_MARKER));
  const cleaned = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (cleaned) {
    debugLog("write", preCommitFile);
    writeFileSync(preCommitFile, cleaned + "\n");
  } else {
    debugLog("write", preCommitFile);
    rmSync(preCommitFile);
  }
  return true;
}

function addToPreCommitConfig(root: string): boolean {
  const configFile = resolve(root, ".pre-commit-config.yaml");
  if (!existsSync(configFile)) return false;

  debugLog("read", configFile);
  const content = readFileSync(configFile, "utf-8");
  if (content.includes(GUARDRAILS_CHECK_MARKER)) return false;

  const newRepo = `
  - repo: local
    hooks:
      - id: guardrails-check
        name: Validate guardrails
        entry: npx guardrails-ref check . --strict
        language: system
        pass_filenames: false
`;
  debugLog("write", configFile);
  writeFileSync(configFile, content.trimEnd() + newRepo + "\n");
  return true;
}

function removeFromPreCommitConfig(root: string): boolean {
  const configFile = resolve(root, ".pre-commit-config.yaml");
  if (!existsSync(configFile)) return false;

  debugLog("read", configFile);
  const content = readFileSync(configFile, "utf-8");
  if (!content.includes(GUARDRAILS_CHECK_MARKER)) return false;

  const lines = content.split("\n");
  const guardIdx = lines.findIndex((l) => l.includes("guardrails-check"));
  if (guardIdx === -1) return false;

  let start = guardIdx;
  while (start > 0 && !lines[start - 1].trim().match(/^-\s+repo:\s/)) start--;
  if (start > 0) start--;

  let end = guardIdx + 1;
  while (end < lines.length && (lines[end].trim() === "" || lines[end].match(/^\s{4,}\S/))) end++;

  const out = [...lines.slice(0, start), ...lines.slice(end)];
  debugLog("write", configFile);
  writeFileSync(configFile, out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
  return true;
}

export function runSetupPreCommit(projectPath: string = ".", remove = false, dryRun = false): PreCommitResult {
  const root = resolve(projectPath);

  if (remove) {
    const huskyDone = removeFromHuskyPreCommit(root);
    const preCommitDone = removeFromPreCommitConfig(root);
    if (dryRun) {
      const huskyPath = resolve(root, ".husky", "pre-commit");
      const preCommitPath = resolve(root, ".pre-commit-config.yaml");
      const wouldHusky =
        existsSync(huskyPath) &&
        (debugLog("read", huskyPath), readFileSync(huskyPath, "utf-8").includes(GUARDRAILS_CHECK_MARKER));
      const wouldPreCommit =
        existsSync(preCommitPath) &&
        (debugLog("read", preCommitPath), readFileSync(preCommitPath, "utf-8").includes(GUARDRAILS_CHECK_MARKER));
      return {
        done: wouldHusky || wouldPreCommit,
        message: (wouldHusky ? chalk.gray("[dry-run] Would remove from .husky/pre-commit\n") : "") + (wouldPreCommit ? chalk.gray("[dry-run] Would remove from .pre-commit-config.yaml") : "") || chalk.yellow("Pre-commit hook not found."),
      };
    }
    if (huskyDone || preCommitDone) {
      return {
        done: true,
        message: chalk.green("✓") + " Removed guardrails check from pre-commit",
      };
    }
    return { done: false, message: chalk.yellow("Pre-commit hook not found.") };
  }

  if (dryRun) {
    const huskyPath = resolve(root, ".husky", "pre-commit");
    const preCommitPath = resolve(root, ".pre-commit-config.yaml");
    const wouldHusky =
      !existsSync(huskyPath) ||
      !(debugLog("read", huskyPath), readFileSync(huskyPath, "utf-8").includes(GUARDRAILS_CHECK_MARKER));
    const wouldPreCommit =
      existsSync(preCommitPath) &&
      !(debugLog("read", preCommitPath), readFileSync(preCommitPath, "utf-8").includes(GUARDRAILS_CHECK_MARKER));
    return {
      done: wouldHusky || wouldPreCommit,
      message: chalk.gray("[dry-run] Would add guardrails check to .husky/pre-commit or .pre-commit-config.yaml"),
    };
  }

  if (existsSync(resolve(root, ".pre-commit-config.yaml"))) {
    if (addToPreCommitConfig(root)) {
      return { done: true, message: chalk.green("✓") + " Added guardrails check to .pre-commit-config.yaml" };
    }
  }

  if (addToHuskyPreCommit(root)) {
    return {
      done: true,
      message: chalk.green("✓") + " Added guardrails check to .husky/pre-commit (run 'npx husky init' if not already set up)",
    };
  }

  return { done: false, message: chalk.yellow("Guardrails check already present in pre-commit.") };
}
