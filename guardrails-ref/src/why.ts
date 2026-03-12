import matter from "gray-matter";
import chalk from "chalk";
import { TEMPLATES, TEMPLATE_NAMES } from "./templates.js";

export function runWhy(name: string, json = false): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  const content = TEMPLATES[normalized];

  if (!content) {
    console.error(chalk.red("Unknown guardrail:") + " " + name);
    console.error(chalk.gray("Available: " + TEMPLATE_NAMES.join(", ")));
    return false;
  }

  if (json) {
    const parsed = matter(content);
    const out = {
      name: parsed.data.name ?? normalized,
      description: parsed.data.description ?? "",
      body: parsed.content.trim(),
      frontmatter: parsed.data,
    };
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(content);
  }
  return true;
}
