import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { resolveGuardrailsDir } from "./path-utils.js";
import { runSetup } from "./setup.js";
import { TEMPLATES } from "./templates.js";

export interface InitResult {
  guardrailsDir: string;
  exampleCreated: boolean;
  setupDone: string;
}

export function runInit(projectPath: string = ".", minimal = false, userScope = false): InitResult {
  const guardrailsDir = resolveGuardrailsDir(projectPath, userScope);
  const exampleDir = join(guardrailsDir, "no-plaintext-secrets");
  const exampleFile = join(exampleDir, "GUARDRAIL.md");

  let exampleCreated = false;

  if (!existsSync(guardrailsDir)) {
    mkdirSync(guardrailsDir, { recursive: true });
    console.log(chalk.green("✓") + " Created " + (userScope ? "~/.agents/guardrails/" : ".agents/guardrails/"));
  }

  if (minimal || userScope) {
    if (userScope && !existsSync(exampleFile)) {
      mkdirSync(exampleDir, { recursive: true });
      writeFileSync(exampleFile, TEMPLATES["no-plaintext-secrets"]);
      exampleCreated = true;
      console.log(chalk.green("✓") + " Created ~/.agents/guardrails/no-plaintext-secrets/GUARDRAIL.md");
    }
    return {
      guardrailsDir,
      exampleCreated,
      setupDone: userScope ? "(setup is project-specific; run setup in each project)" : "",
    };
  }

  if (!existsSync(exampleFile)) {
    mkdirSync(exampleDir, { recursive: true });
    writeFileSync(exampleFile, TEMPLATES["no-plaintext-secrets"]);
    exampleCreated = true;
    console.log(chalk.green("✓") + " Created .agents/guardrails/no-plaintext-secrets/GUARDRAIL.md");
  } else {
    console.log(chalk.yellow("  .agents/guardrails/no-plaintext-secrets/GUARDRAIL.md already exists"));
  }

  const setupResult = runSetup(projectPath); // project-level only
  console.log(setupResult.message);

  return {
    guardrailsDir,
    exampleCreated,
    setupDone: setupResult.message,
  };
}
