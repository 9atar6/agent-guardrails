import chalk from "chalk";
import { TEMPLATES, TEMPLATE_NAMES } from "./templates.js";

export function runWhy(name: string): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  const content = TEMPLATES[normalized];

  if (!content) {
    console.error(chalk.red("Unknown guardrail:") + " " + name);
    console.error(chalk.gray("Available: " + TEMPLATE_NAMES.join(", ")));
    return false;
  }

  console.log(content);
  return true;
}
