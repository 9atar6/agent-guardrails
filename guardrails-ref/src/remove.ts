import { existsSync, readdirSync, rmSync, rmdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { resolveGuardrailsDir } from "./path-utils.js";
import { debugLog } from "./debug.js";
import { listGuardrails } from "./validate.js";

export function runRemove(
  name: string,
  projectPath: string = ".",
  userScope = false,
  dryRun = false
): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  const guardrailsDir = resolveGuardrailsDir(projectPath, userScope);
  const targetDir = join(guardrailsDir, normalized);
  const targetFile = join(targetDir, "GUARDRAIL.md");

  const pathLabel = userScope ? "~/.agents/guardrails/" : ".agents/guardrails/";
  if (!existsSync(targetFile)) {
    const guardrails = listGuardrails(guardrailsDir);
    const names = guardrails.map((g) => g.name);
    console.log(chalk.red("Guardrail not found:") + " " + pathLabel + normalized);
    if (names.length > 0) {
      console.log(chalk.gray("Installed: " + names.join(", ")));
    }
    return false;
  }

  if (dryRun) {
    console.log(chalk.green("Would remove:") + " " + pathLabel + normalized);
    return true;
  }

  debugLog("write", targetDir);
  rmSync(targetDir, { recursive: true });
  console.log(chalk.green("✓") + " Removed " + pathLabel + normalized);

  // Remove parent dir if empty
  try {
    debugLog("read", guardrailsDir);
    const remaining = readdirSync(guardrailsDir);
    if (remaining.length === 0) {
      if (dryRun) {
        console.log(chalk.green("Would remove empty:") + " " + pathLabel);
      } else {
        debugLog("write", guardrailsDir);
        rmdirSync(guardrailsDir);
        console.log(chalk.green("✓") + " Removed empty " + pathLabel);
      }
    }
  } catch {
    // Ignore
  }

  return true;
}
