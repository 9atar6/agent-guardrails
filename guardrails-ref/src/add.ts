import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { resolveGuardrailsDir } from "./path-utils.js";
import { debugLog } from "./debug.js";
import { TEMPLATES, TEMPLATE_NAMES } from "./templates.js";

export function runAdd(name: string, projectPath: string = ".", userScope = false, dryRun = false): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  const content = TEMPLATES[normalized];

  if (!content) {
    console.log(chalk.red("Unknown guardrail:") + " " + name);
    console.log(chalk.gray("Available: " + TEMPLATE_NAMES.join(", ")));
    return false;
  }

  const guardrailsDir = resolveGuardrailsDir(projectPath, userScope);
  const exampleDir = join(guardrailsDir, normalized);
  const exampleFile = join(exampleDir, "GUARDRAIL.md");

  const pathLabel = userScope ? "~/.agents/guardrails/" : ".agents/guardrails/";
  if (existsSync(exampleFile)) {
    if (dryRun) {
      console.log(chalk.gray("Would skip (already exists):") + " " + pathLabel + normalized + "/GUARDRAIL.md");
    } else {
      console.log(chalk.yellow(pathLabel + normalized + "/GUARDRAIL.md already exists"));
    }
    return true;
  }

  if (dryRun) {
    console.log(chalk.green("Would add:") + " " + pathLabel + normalized + "/GUARDRAIL.md");
    return true;
  }

  if (!existsSync(guardrailsDir)) {
    debugLog("write", guardrailsDir);
    mkdirSync(guardrailsDir, { recursive: true });
    console.log(chalk.green("✓") + " Created " + pathLabel);
  }

  debugLog("write", exampleDir);
  mkdirSync(exampleDir, { recursive: true });
  debugLog("write", exampleFile);
  writeFileSync(exampleFile, content);
  console.log(chalk.green("✓") + " Added " + pathLabel + normalized + "/GUARDRAIL.md");
  return true;
}
