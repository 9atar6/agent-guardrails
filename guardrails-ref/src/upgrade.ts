import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { createPatch } from "diff";
import { TEMPLATES } from "./templates.js";

export interface UpgradeResult {
  updated: string[];
  skipped: string[];
  notFound: string[];
}

function printDiff(name: string, current: string, template: string): void {
  const patch = createPatch(
    ".agents/guardrails/" + name + "/GUARDRAIL.md",
    current,
    template,
    "current",
    "template"
  );
  // Skip the first two lines (--- and +++ headers) and show the rest
  const lines = patch.split("\n");
  const body = lines.slice(2).join("\n");
  if (body.trim()) {
    console.log(chalk.gray(body));
  }
}

export function runUpgrade(
  projectPath: string = ".",
  dryRun = false,
  showDiff = false
): UpgradeResult {
  const root = resolve(projectPath);
  const guardrailsDir = resolve(root, ".agents", "guardrails");
  const result: UpgradeResult = { updated: [], skipped: [], notFound: [] };

  if (!existsSync(guardrailsDir)) {
    console.log(chalk.yellow("No .agents/guardrails/ directory found"));
    return result;
  }

  const entries = readdirSync(guardrailsDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const name = ent.name.toLowerCase().replace(/\s+/g, "-");
    const template = TEMPLATES[name];
    const filePath = resolve(guardrailsDir, ent.name, "GUARDRAIL.md");

    if (!existsSync(filePath)) continue;
    if (!template) {
      result.notFound.push(name);
      continue;
    }

    const current = readFileSync(filePath, "utf-8");
    if (current.trim() === template.trim()) {
      result.skipped.push(name);
      continue;
    }

    result.updated.push(name);
    if (!dryRun) {
      if (showDiff) {
        printDiff(name, current, template);
      }
      writeFileSync(filePath, template);
      console.log(chalk.green("✓") + " Updated .agents/guardrails/" + name + "/GUARDRAIL.md");
    } else {
      console.log(chalk.cyan("Would update") + " .agents/guardrails/" + name + "/GUARDRAIL.md");
      if (showDiff) {
        printDiff(name, current, template);
      }
    }
  }

  if (result.updated.length === 0 && result.skipped.length > 0) {
    console.log(chalk.gray("All " + result.skipped.length + " guardrail(s) already up to date"));
  }
  if (result.notFound.length > 0) {
    console.log(chalk.yellow("No template for:") + " " + result.notFound.join(", "));
  }

  return result;
}
