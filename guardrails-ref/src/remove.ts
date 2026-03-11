import { existsSync, readdirSync, rmSync, rmdirSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { listGuardrails } from "./validate.js";

export function runRemove(name: string, projectPath: string = "."): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  const root = resolve(projectPath);
  const guardrailsDir = resolve(root, ".agents", "guardrails");
  const targetDir = resolve(guardrailsDir, normalized);
  const targetFile = resolve(targetDir, "GUARDRAIL.md");

  if (!existsSync(targetFile)) {
    const guardrails = listGuardrails(projectPath);
    const names = guardrails.map((g) => g.name);
    console.log(chalk.red("Guardrail not found:") + " .agents/guardrails/" + normalized);
    if (names.length > 0) {
      console.log(chalk.gray("Installed: " + names.join(", ")));
    }
    return false;
  }

  rmSync(targetDir, { recursive: true });
  console.log(chalk.green("✓") + " Removed .agents/guardrails/" + normalized);

  // Remove parent dir if empty
  try {
    const remaining = readdirSync(guardrailsDir);
    if (remaining.length === 0) {
      rmdirSync(guardrailsDir);
      console.log(chalk.green("✓") + " Removed empty .agents/guardrails/");
    }
  } catch {
    // Ignore
  }

  return true;
}
