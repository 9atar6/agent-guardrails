import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { TEMPLATES } from "./templates.js";

export interface UpgradeResult {
  updated: string[];
  skipped: string[];
  notFound: string[];
}

export function runUpgrade(projectPath: string = ".", dryRun = false): UpgradeResult {
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
      writeFileSync(filePath, template);
      console.log(chalk.green("✓") + " Updated .agents/guardrails/" + name + "/GUARDRAIL.md");
    } else {
      console.log(chalk.cyan("Would update") + " .agents/guardrails/" + name + "/GUARDRAIL.md");
    }
  }

  if (result.updated.length === 0 && !dryRun) {
    if (result.skipped.length > 0) {
      console.log(chalk.gray("All " + result.skipped.length + " guardrail(s) already up to date"));
    }
  }
  if (result.notFound.length > 0) {
    console.log(chalk.yellow("No template for:") + " " + result.notFound.join(", "));
  }

  return result;
}
