#!/usr/bin/env node

import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { program } from "commander";
import chalk from "chalk";
import { validatePath, listGuardrails } from "./validate.js";
import { runSetup, runSetupRemove, runSetupCheck } from "./setup.js";
import { runInit } from "./init.js";
import { runAdd } from "./add.js";
import { runWhy } from "./why.js";
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
  .action(function (this: { opts: () => { json?: boolean; strict?: boolean } }, path?: string) {
    const opts = this.opts();
    runValidate(path ?? ".", opts);
  });

program
  .command("check [path]")
  .description("Validate guardrails with minimal output (CI-friendly alias)")
  .option("-s, --strict", "Fail on warnings")
  .action(function (this: { opts: () => { strict?: boolean } }, path?: string) {
    const opts = this.opts();
    runValidate(path ?? ".", { ...opts, minimal: true });
  });

program
  .command("init [path]")
  .description("Create .agents/guardrails/, add no-plaintext-secrets, and run setup (one command to get started)")
  .option("-m, --minimal", "Create .agents/guardrails/ only, no example and no setup")
  .action(function (this: { opts: () => { minimal?: boolean } }, path?: string) {
    const opts = this.opts();
    runInit(path ?? ".", opts.minimal);
  });

program
  .command("add [names...]")
  .description("Add example guardrail(s) by name — pass multiple to add several at once")
  .option("-l, --list", "List available guardrails to add")
  .option("-p, --path <path>", "Target directory", ".")
  .action(function (this: { opts: () => { list?: boolean; path?: string } }, names: string[] = []) {
    const opts = this.opts();
    if (opts.list) {
      console.log("Available guardrails:");
      for (const n of TEMPLATE_NAMES) {
        console.log("  " + n);
      }
      console.log("\nUsage: npx guardrails-ref add <name> [name2 ...] [path]");
      return;
    }
    // If last arg looks like a path, use it (backward compat: add name .)
    // --path takes precedence when explicitly provided (opts.path !== ".")
    let targetPath = opts.path ?? ".";
    const args = names.filter((n) => n != null && String(n).trim());
    const looksLikePath = (s: string) =>
      s === "." || s === ".." || s.includes("/") || s.includes("\\");
    if (args.length >= 1 && looksLikePath(args[args.length - 1])) {
      if (args.length === 1) {
        console.log("Usage: npx guardrails-ref add <name> [name2 ...] [path]");
        console.log("Use --list to see available guardrails");
        process.exit(1);
        return;
      }
      if (targetPath === ".") targetPath = args.pop()!;
      else args.pop(); // discard positional when --path was explicit
    }
    if (args.length === 0) {
      console.log("Usage: npx guardrails-ref add <name> [name2 ...] [path]");
      console.log("Use --list to see available guardrails");
      process.exit(1);
      return;
    }
    let failed = 0;
    for (const name of args) {
      if (!name.trim()) continue;
      if (!runAdd(name, targetPath)) failed++;
    }
    process.exit(failed > 0 ? 1 : 0);
  });

program
  .command("upgrade [path]")
  .description("Update installed guardrails to latest template versions")
  .option("-n, --dry-run", "Show what would be updated without writing")
  .option("-d, --diff", "Show diff for each updated guardrail")
  .action(function (this: { opts: () => { dryRun?: boolean; diff?: boolean } }, path?: string) {
    const opts = this.opts();
    runUpgrade(path ?? ".", opts.dryRun, opts.diff);
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
  .description("Add the guardrail rule to Cursor, Claude Code, and VS Code Copilot (required until IDEs support guardrails natively)")
  .option("-r, --remove", "Remove the guardrail rule from IDE configs")
  .option("-i, --ide <name>", "Target IDE: cursor, claude, copilot, or auto (only configured IDEs)")
  .option("-n, --dry-run", "Show what would be added/removed without writing files")
  .option("-c, --check", "Show which IDEs are configured and whether they have the rule")
  .action(function (this: { opts: () => { remove?: boolean; ide?: string; dryRun?: boolean; check?: boolean } }, path?: string) {
    const p = path ?? ".";
    const opts = this.opts();
    if (opts.check) {
      const check = runSetupCheck(p);
      const fmt = (name: string, r: { configured: boolean; hasRule: boolean }) => {
        const status = !r.configured ? "not configured" : r.hasRule ? "has rule" : "no rule";
        const color = !r.configured ? chalk.gray : r.hasRule ? chalk.green : chalk.yellow;
        console.log(`  ${name.padEnd(12)} ${color(status)}`);
      };
      console.log("IDE setup status:");
      fmt("Cursor", check.cursor);
      fmt("Claude Code", check.claude);
      fmt("VS Code Copilot", check.copilot);
      return;
    }
    const ide = opts.ide as "cursor" | "claude" | "copilot" | "auto" | undefined;
    if (ide && !["cursor", "claude", "copilot", "auto"].includes(ide)) {
      console.error(chalk.red("Invalid --ide. Use: cursor, claude, copilot, or auto"));
      process.exit(1);
    }
    const result = opts.remove
      ? runSetupRemove(p, ide, opts.dryRun)
      : runSetup(p, ide, opts.dryRun);
    console.log(result.message);
  });

program
  .command("why <name>")
  .description("Show guardrail content (e.g. npx guardrails-ref why no-destructive-commands)")
  .action((name: string) => {
    const ok = runWhy(name);
    process.exit(ok ? 0 : 1);
  });

program
  .command("list [path]")
  .description("List discovered guardrails")
  .option("-j, --json", "Output as JSON")
  .action(function (this: { opts: () => { json?: boolean } }, path?: string) {
    const opts = this.opts();
    const guardrails = listGuardrails(path ?? ".");

    if (opts.json) {
      console.log(JSON.stringify({ guardrails, total: guardrails.length }, null, 2));
      process.exit(guardrails.length === 0 ? 1 : 0);
      return;
    }

    if (guardrails.length === 0) {
      console.log(chalk.yellow("No guardrails found"));
      process.exit(1);
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
