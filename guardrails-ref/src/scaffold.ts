import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { resolveGuardrailsDir } from "./path-utils.js";
import { debugLog } from "./debug.js";

const NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ScaffoldOptions {
  projectPath?: string;
  userScope?: boolean;
  scope?: "global" | "project" | "session";
  severity?: "critical" | "warning" | "advisory";
  dryRun?: boolean;
}

export function runScaffold(name: string, opts: ScaffoldOptions = {}): boolean {
  const normalized = name.toLowerCase().trim();

  if (!NAME_REGEX.test(normalized)) {
    console.error(
      chalk.red("Invalid name:") +
        " " +
        name +
        chalk.gray(
          "\nHint: use lowercase letters, numbers, and hyphens only (no leading/trailing or consecutive hyphens)."
        )
    );
    return false;
  }

  const projectPath = opts.projectPath ?? ".";
  const guardrailsDir = resolveGuardrailsDir(projectPath, opts.userScope);
  const guardrailDir = join(guardrailsDir, normalized);
  const guardrailFile = join(guardrailDir, "GUARDRAIL.md");
  const pathLabel = opts.userScope ? "~/.agents/guardrails/" : ".agents/guardrails/";

  if (existsSync(guardrailFile)) {
    if (opts.dryRun) {
      console.log(
        chalk.gray("Would skip (already exists):") + " " + pathLabel + normalized + "/GUARDRAIL.md"
      );
    } else {
      console.log(
        chalk.yellow(pathLabel + normalized + "/GUARDRAIL.md already exists") +
          chalk.gray(" (use validate --fix to normalize)")
      );
    }
    return true;
  }

  const scope = opts.scope ?? "project";
  const severity = opts.severity ?? "warning";

  const humanTitle =
    normalized.charAt(0).toUpperCase() +
    normalized
      .slice(1)
      .replace(/-/g, " ")
      .replace(/\b([a-z])/g, (m) => m.toUpperCase());

  const contentLines: string[] = [
    "---",
    `name: ${normalized}`,
    'description: TODO: Describe what this guardrail prevents and when it applies (1-1024 characters).',
    `scope: ${scope}`,
    `severity: ${severity}`,
    "triggers:",
    '  - "TODO: When this guardrail is relevant (e.g. Adding logging)"',
    "metadata:",
    "  author: TODO: your-name-or-org",
    '  version: "1.0"',
    "---",
    "",
    `# ${humanTitle}`,
    "",
    "## Trigger",
    "Describe when this guardrail applies. Mention concrete actions or contexts.",
    "",
    "## Instruction",
    "- Describe what the agent must do or must NOT do, as concrete steps.",
    "- Keep this deterministic and testable.",
    "",
    "## Reason",
    "Explain why this guardrail exists, ideally tying back to a real incident or risk.",
    "",
  ];

  const content = contentLines.join("\n");

  if (opts.dryRun) {
    console.log(chalk.green("Would add:") + " " + pathLabel + normalized + "/GUARDRAIL.md");
    return true;
  }

  if (!existsSync(guardrailsDir)) {
    debugLog("write", guardrailsDir);
    mkdirSync(guardrailsDir, { recursive: true });
    console.log(chalk.green("✓") + " Created " + pathLabel);
  }

  debugLog("write", guardrailDir);
  mkdirSync(guardrailDir, { recursive: true });
  debugLog("write", guardrailFile);
  writeFileSync(guardrailFile, content);
  console.log(chalk.green("✓") + " Scaffolded " + pathLabel + normalized + "/GUARDRAIL.md");

  return true;
}

