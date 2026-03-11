#!/usr/bin/env node

import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { program } from "commander";
import chalk from "chalk";
import { validatePath, listGuardrails } from "./validate.js";
import { runSetup, runSetupRemove } from "./setup.js";
import { runInit } from "./init.js";
import { runAdd } from "./add.js";
import { runRemove } from "./remove.js";
import { runUpgrade } from "./upgrade.js";
import { TEMPLATE_NAMES } from "./templates.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = require("../package.json") as { version: string };

program
  .name("guardrails-ref")
  .description("Validate and list Agent Guardrails (GUARDRAIL.md) files")
  .version(pkg.version);

function runValidate(
  path: string,
  options: { json?: boolean; strict?: boolean; minimal?: boolean }
): void {
  const result = validatePath(path);
  const hasWarnings = result.results.some((r) => r.warnings.length > 0);
  const hasErrors = result.invalid > 0;
  const strictFail = options.strict && hasWarnings;
  const exitCode = hasErrors || strictFail ? 1 : 0;

  if (options.minimal) {
    if (exitCode === 0) {
      console.log("OK");
    } else {
      console.error("FAIL");
      for (const r of result.results) {
        if (!r.success) {
          console.error(r.path, r.errors.join("; "));
        } else if (options.strict && r.warnings.length > 0) {
          console.error(r.path, r.warnings.join("; "));
        }
      }
    }
    process.exit(exitCode);
    return;
  }

  if (options.json) {
    const json = {
      valid: result.valid,
      invalid: result.invalid,
      total: result.total,
      results: result.results.map((r) => ({
        path: r.path,
        success: r.success,
        errors: r.errors,
        warnings: r.warnings,
      })),
    };
    console.log(JSON.stringify(json, null, 2));
    process.exit(exitCode);
    return;
  }

  let hasErrorsOut = false;
  for (const r of result.results) {
    if (r.success) {
      const warnStr = r.warnings.length > 0 ? chalk.yellow(` (${r.warnings.length} warnings)`) : "";
      console.log(chalk.green("✓"), r.path, warnStr);
      for (const w of r.warnings) {
        console.log(chalk.yellow("  warning:"), w);
      }
    } else {
      hasErrorsOut = true;
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

  process.exit(hasErrorsOut || strictFail ? 1 : 0);
}

program
  .command("validate [path]")
  .description("Validate GUARDRAIL.md files in a directory or a single file")
  .option("-j, --json", "Output as JSON")
  .option("-s, --strict", "Fail on warnings (CI mode)")
  .action((path = ".", options: { json?: boolean; strict?: boolean } = {}) => {
    runValidate(path, options);
  });

program
  .command("check [path]")
  .description("Validate guardrails with minimal output (CI-friendly alias)")
  .option("-s, --strict", "Fail on warnings")
  .action((path = ".", options: { strict?: boolean } = {}) => {
    runValidate(path, { ...options, minimal: true });
  });

program
  .command("init [path]")
  .description("Create .agents/guardrails/, add no-plaintext-secrets, and run setup (one command to get started)")
  .action((path = ".") => {
    runInit(path);
  });

program
  .command("add [name] [path]")
  .description("Add an example guardrail by name (use --list to see available)")
  .option("-l, --list", "List available guardrails to add")
  .action((name: string | undefined, path?: string, cmd?: { opts: () => { list?: boolean } }) => {
    const opts = cmd?.opts?.() ?? {};
    if (opts.list) {
      console.log("Available guardrails:");
      for (const n of TEMPLATE_NAMES) {
        console.log("  " + n);
      }
      console.log("\nUsage: npx guardrails-ref add <name> [path]");
      return;
    }
    if (!name || !name.trim()) {
      console.log("Usage: npx guardrails-ref add <name> [path]");
      console.log("Use --list to see available guardrails");
      process.exit(1);
      return;
    }
    const ok = runAdd(name, path ?? ".");
    process.exit(ok ? 0 : 1);
  });

program
  .command("upgrade [path]")
  .description("Update installed guardrails to latest template versions")
  .option("-n, --dry-run", "Show what would be updated without writing")
  .action((path?: string, cmd?: { opts: () => { dryRun?: boolean } }) => {
    const opts = cmd?.opts?.() ?? {};
    runUpgrade(path ?? ".", opts.dryRun);
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
  .option("-r, --remove", "Remove the guardrail rule from Cursor and Claude config")
  .action((path: string | undefined, cmd?: { opts: () => { remove?: boolean } }) => {
    const p = path ?? ".";
    const opts = cmd?.opts?.() ?? {};
    const result = opts.remove ? runSetupRemove(p) : runSetup(p);
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
