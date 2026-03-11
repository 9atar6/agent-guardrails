#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import { validatePath, listGuardrails } from "./validate.js";
import { runSetup } from "./setup.js";
import { runInit } from "./init.js";
import { runAdd } from "./add.js";
import { runRemove } from "./remove.js";

program
  .name("guardrails-ref")
  .description("Validate and list Agent Guardrails (GUARDRAIL.md) files")
  .version("1.0.0");

program
  .command("validate [path]")
  .description("Validate GUARDRAIL.md files in a directory or a single file")
  .action((path = ".") => {
    const result = validatePath(path);
    let hasErrors = false;

    for (const r of result.results) {
      if (r.success) {
        const warnStr = r.warnings.length > 0 ? chalk.yellow(` (${r.warnings.length} warnings)`) : "";
        console.log(chalk.green("✓"), r.path, warnStr);
        for (const w of r.warnings) {
          console.log(chalk.yellow("  warning:"), w);
        }
      } else {
        hasErrors = true;
        console.log(chalk.red("✗"), r.path);
        for (const e of r.errors) {
          console.log(chalk.red("  error:"), e);
        }
        for (const w of r.warnings) {
          console.log(chalk.yellow("  warning:"), w);
        }
      }
    }

    if (result.total === 0) {
      console.log(chalk.yellow("No GUARDRAIL.md or GUARDRAILS.md files found"));
    } else {
      console.log();
      console.log(`Valid: ${result.valid}/${result.total}  Invalid: ${result.invalid}/${result.total}`);
    }

    process.exit(hasErrors ? 1 : 0);
  });

program
  .command("init [path]")
  .description("Create .agents/guardrails/, add no-plaintext-secrets, and run setup (one command to get started)")
  .action((path = ".") => {
    runInit(path);
  });

program
  .command("add <name> [path]")
  .description("Add an example guardrail by name (e.g. no-destructive-commands, no-new-deps-without-approval)")
  .action((name, path = ".") => {
    const ok = runAdd(name, path);
    process.exit(ok ? 0 : 1);
  });

program
  .command("remove <name> [path]")
  .description("Remove a guardrail from .agents/guardrails/")
  .action((name, path = ".") => {
    const ok = runRemove(name, path);
    process.exit(ok ? 0 : 1);
  });

program
  .command("setup [path]")
  .description("Add the guardrail one-liner to Cursor rules and Claude instructions (required until IDEs support guardrails natively)")
  .action((path = ".") => {
    const result = runSetup(path);
    console.log(result.message);
  });

program
  .command("list [path]")
  .description("List discovered guardrails")
  .option("-j, --json", "Output as JSON")
  .action((path = ".", options: { json?: boolean }) => {
    const guardrails = listGuardrails(path);

    if (options.json) {
      console.log(JSON.stringify({ guardrails, total: guardrails.length }, null, 2));
      return;
    }

    if (guardrails.length === 0) {
      console.log(chalk.yellow("No guardrails found"));
      return;
    }

    for (const g of guardrails) {
      console.log(chalk.cyan(g.name));
      console.log("  ", g.description.slice(0, 80) + (g.description.length > 80 ? "..." : ""));
      console.log("  ", chalk.gray(g.path));
      console.log();
    }
    console.log(`Total: ${guardrails.length} guardrail(s)`);
  });

program.parse();
