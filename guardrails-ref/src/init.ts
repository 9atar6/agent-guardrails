import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { runSetup } from "./setup.js";
import { TEMPLATES } from "./templates.js";

export interface InitResult {
  guardrailsDir: string;
  exampleCreated: boolean;
  setupDone: string;
}

export function runInit(projectPath: string = ".", minimal = false): InitResult {
  const root = resolve(projectPath);
  const guardrailsDir = resolve(root, ".agents", "guardrails");
  const exampleDir = resolve(guardrailsDir, "no-plaintext-secrets");
  const exampleFile = resolve(exampleDir, "GUARDRAIL.md");

  let exampleCreated = false;

  if (!existsSync(guardrailsDir)) {
    mkdirSync(guardrailsDir, { recursive: true });
    console.log(chalk.green("✓") + " Created .agents/guardrails/");
  }

  if (minimal) {
    return {
      guardrailsDir,
      exampleCreated: false,
      setupDone: "",
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

  const setupResult = runSetup(projectPath);
  console.log(setupResult.message);

  return {
    guardrailsDir,
    exampleCreated,
    setupDone: setupResult.message,
  };
}
