import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { TEMPLATES, TEMPLATE_NAMES } from "./templates.js";

export function runAdd(name: string, projectPath: string = "."): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  const content = TEMPLATES[normalized];

  if (!content) {
    console.log(chalk.red("Unknown guardrail:") + " " + name);
    console.log(chalk.gray("Available: " + TEMPLATE_NAMES.join(", ")));
    return false;
  }

  const root = resolve(projectPath);
  const guardrailsDir = resolve(root, ".agents", "guardrails");
  const exampleDir = resolve(guardrailsDir, normalized);
  const exampleFile = resolve(exampleDir, "GUARDRAIL.md");

  if (existsSync(exampleFile)) {
    console.log(chalk.yellow(".agents/guardrails/" + normalized + "/GUARDRAIL.md already exists"));
    return true;
  }

  if (!existsSync(guardrailsDir)) {
    mkdirSync(guardrailsDir, { recursive: true });
    console.log(chalk.green("✓") + " Created .agents/guardrails/");
  }

  mkdirSync(exampleDir, { recursive: true });
  writeFileSync(exampleFile, content);
  console.log(chalk.green("✓") + " Added .agents/guardrails/" + normalized + "/GUARDRAIL.md");
  return true;
}
