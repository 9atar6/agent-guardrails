import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { resolveGuardrailsDir } from "./path-utils.js";
import { runSetup } from "./setup.js";
import { TEMPLATES, PRESETS } from "./templates.js";

export interface InitResult {
  guardrailsDir: string;
  exampleCreated: boolean;
  setupDone: string;
}

export function runInit(
  projectPath: string = ".",
  minimal = false,
  userScope = false,
  preset?: string
): InitResult {
  const guardrailsDir = resolveGuardrailsDir(projectPath, userScope);
  const pathLabel = userScope ? "~/.agents/guardrails/" : ".agents/guardrails/";

  let exampleCreated = false;

  if (!existsSync(guardrailsDir)) {
    mkdirSync(guardrailsDir, { recursive: true });
    console.log(chalk.green("✓") + " Created " + pathLabel);
  }

  if (minimal || userScope) {
    if (!minimal && userScope && preset) {
      const presetNames = PRESETS[preset.toLowerCase()];
      if (presetNames) {
        for (const name of presetNames) {
          const exampleDir = join(guardrailsDir, name);
          const exampleFile = join(exampleDir, "GUARDRAIL.md");
          const content = TEMPLATES[name];
          if (content && !existsSync(exampleFile)) {
            mkdirSync(exampleDir, { recursive: true });
            writeFileSync(exampleFile, content);
            exampleCreated = true;
            console.log(chalk.green("✓") + " Added " + pathLabel + name + "/GUARDRAIL.md");
          }
        }
      }
    } else if (!minimal && userScope && !preset) {
      const exampleDir = join(guardrailsDir, "no-plaintext-secrets");
      const exampleFile = join(exampleDir, "GUARDRAIL.md");
      if (!existsSync(exampleFile)) {
        mkdirSync(exampleDir, { recursive: true });
        writeFileSync(exampleFile, TEMPLATES["no-plaintext-secrets"]);
        exampleCreated = true;
        console.log(chalk.green("✓") + " Created ~/.agents/guardrails/no-plaintext-secrets/GUARDRAIL.md");
      }
    }
    return {
      guardrailsDir,
      exampleCreated,
      setupDone: userScope ? "(setup is project-specific; run setup in each project)" : "",
    };
  }

  if (preset) {
    const presetNames = PRESETS[preset.toLowerCase()];
    if (!presetNames) {
      console.error(chalk.red("Unknown preset:") + " " + preset);
      console.error(chalk.gray("Available: " + Object.keys(PRESETS).join(", ")));
      const setupResult = runSetup(projectPath);
      console.log(setupResult.message);
      return { guardrailsDir, exampleCreated: false, setupDone: setupResult.message };
    }
    for (const name of presetNames) {
      const exampleDir = join(guardrailsDir, name);
      const exampleFile = join(exampleDir, "GUARDRAIL.md");
      const content = TEMPLATES[name];
      if (!content) continue;
      if (existsSync(exampleFile)) {
        console.log(chalk.yellow("  " + pathLabel + name + "/GUARDRAIL.md already exists"));
        continue;
      }
      mkdirSync(exampleDir, { recursive: true });
      writeFileSync(exampleFile, content);
      console.log(chalk.green("✓") + " Added " + pathLabel + name + "/GUARDRAIL.md");
      exampleCreated = true;
    }
  } else {
    const exampleDir = join(guardrailsDir, "no-plaintext-secrets");
    const exampleFile = join(exampleDir, "GUARDRAIL.md");
    if (!existsSync(exampleFile)) {
      mkdirSync(exampleDir, { recursive: true });
      writeFileSync(exampleFile, TEMPLATES["no-plaintext-secrets"]);
      exampleCreated = true;
      console.log(chalk.green("✓") + " Created .agents/guardrails/no-plaintext-secrets/GUARDRAIL.md");
    } else {
      console.log(chalk.yellow("  .agents/guardrails/no-plaintext-secrets/GUARDRAIL.md already exists"));
    }
  }

  const setupResult = runSetup(projectPath); // project-level only
  console.log(setupResult.message);

  return {
    guardrailsDir,
    exampleCreated,
    setupDone: setupResult.message,
  };
}
