#!/usr/bin/env node

import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { program } from "commander";
import chalk from "chalk";
import { validatePath, listGuardrails, fixGuardrailFile } from "./validate.js";
import { runSetup, runSetupRemove, runSetupCheck, type IdeName } from "./setup.js";
import { runSetupPreCommit } from "./pre-commit.js";
import { runInit } from "./init.js";
import { runAdd } from "./add.js";
import { runWhy } from "./why.js";
import { runRemove } from "./remove.js";
import { runUpgrade } from "./upgrade.js";
import { resolveGuardrailsDir } from "./path-utils.js";
import { TEMPLATE_NAMES, PRESETS } from "./templates.js";
import { setDebug } from "./debug.js";
import { runScaffold } from "./scaffold.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = require("../package.json") as { version: string };

function isReadOnlyEnv(): boolean {
  const value = process.env.GUARDRAILS_REF_READONLY;
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

program
  .name("guardrails-ref")
  .description("Validate and list Agent Guardrails (GUARDRAIL.md) files")
  .version(pkg.version)
  .option("-d, --debug", "Log every filesystem read/write path (for auditing)")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.optsWithGlobals() as { debug?: boolean };
    const v = process.env.GUARDRAILS_REF_DEBUG;
    const fromEnv =
      v === "1" || ["true", "yes"].includes(v?.toLowerCase() ?? "");
    setDebug(opts.debug ?? fromEnv);
  });

function runValidate(
  path: string,
  options: {
    json?: boolean;
    strict?: boolean;
    minimal?: boolean;
    user?: boolean;
    fix?: boolean;
    dryRun?: boolean;
    readOnlyEnv?: boolean;
  }
): void {
  const userScope = options.user ?? path === "~";
  const pathToScan = userScope ? resolveGuardrailsDir("~", true) : path;
  let result = validatePath(pathToScan);

  const effectiveDryRun = (options.dryRun ?? false) || (options.readOnlyEnv ?? false);

  if (options.fix) {
    const fixed: string[] = [];
    const wouldFix: string[] = [];
    for (const r of result.results) {
      if (r.success && r.path) {
        if (effectiveDryRun) {
          if (fixGuardrailFile(r.path, true)) {
            wouldFix.push(r.path);
          }
        } else if (fixGuardrailFile(r.path, false)) {
          fixed.push(r.path);
        }
      }
    }
    if (!options.json && !options.minimal) {
      for (const p of fixed) console.log(chalk.green("✓") + " Fixed " + p);
      for (const p of wouldFix) console.log(chalk.green("[dry-run] Would fix") + " " + p);
    }
    if (fixed.length > 0) {
      result = validatePath(pathToScan);
    }
  }
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
  .option("-u, --user", "Use user-level guardrails (~/.agents/guardrails/)")
  .option("-f, --fix", "Apply fixes (whitespace, newline, frontmatter key order)")
  .option("-n, --dry-run", "Show which files would be fixed without writing")
  .action(function (
    this: {
      opts: () => { json?: boolean; strict?: boolean; user?: boolean; fix?: boolean; dryRun?: boolean };
    },
    path?: string
  ) {
    const opts = this.opts();
    runValidate(path ?? ".", { ...opts, readOnlyEnv: isReadOnlyEnv() });
  });

program
  .command("check [path]")
  .description("Validate guardrails with minimal output (CI-friendly alias)")
  .option("-s, --strict", "Fail on warnings")
  .action(function (this: { opts: () => { strict?: boolean } }, path?: string) {
    const opts = this.opts();
    runValidate(path ?? ".", { ...opts, minimal: true, readOnlyEnv: isReadOnlyEnv() });
  });

program
  .command("init [path]")
  .description("Create .agents/guardrails/, add example(s), and run setup (one command to get started)")
  .option("-m, --minimal", "Create .agents/guardrails/ only, no example and no setup")
  .option("-p, --preset <name>", "Add preset instead of no-plaintext-secrets (e.g. default, security)")
  .option("-u, --user", "Create ~/.agents/guardrails/ (user-level); setup is project-specific")
  .option(
    "-n, --dry-run",
    "Show what would be created and which IDE configs would be touched, without writing"
  )
  .action(function (
    this: { opts: () => { minimal?: boolean; preset?: string; user?: boolean; dryRun?: boolean } },
    path?: string
  ) {
    const opts = this.opts();
    const readOnlyEnv = isReadOnlyEnv();
    const dryRun = opts.dryRun ?? readOnlyEnv;
    runInit(path ?? ".", opts.minimal, opts.user, opts.preset, dryRun);
  });

program
  .command("add [names...]")
  .description("Add example guardrail(s) by name — pass multiple to add several at once")
  .option("-l, --list", "List available guardrails to add")
  .option("--preset <name>", "Add preset(s); comma-separated for multiple (e.g. default,frontend)")
  .option("-p, --path <path>", "Target directory", ".")
  .option("-u, --user", "Add to user-level ~/.agents/guardrails/")
  .option("-n, --dry-run", "Show what would be added without writing files")
  .action(function (this: { opts: () => { list?: boolean; preset?: string; path?: string; user?: boolean; dryRun?: boolean } }, names: string[] = []) {
    const opts = this.opts();
    if (opts.list) {
      console.log("Available guardrails:");
      for (const n of TEMPLATE_NAMES) {
        console.log("  " + n);
      }
      console.log("\nPresets: " + Object.keys(PRESETS).map((p) => `add --preset ${p}`).join(" | "));
      console.log("Multiple: add --preset default,frontend");
      console.log("Usage: npx guardrails-ref add <name> [name2 ...] [path]");
      return;
    }
    if (opts.preset) {
      const presetIds = opts.preset.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
      const collected = new Set<string>();
      for (const id of presetIds) {
        const presetGuardrails = PRESETS[id];
        if (!presetGuardrails) {
          console.error(chalk.red("Unknown preset:") + " " + id);
          console.error(chalk.gray("Available: " + Object.keys(PRESETS).join(", ")));
          process.exit(1);
        }
        for (const g of presetGuardrails) collected.add(g);
      }
      names = [...collected];
    }
    // If last arg looks like a path, use it (backward compat: add name .)
    // --path takes precedence when explicitly provided (opts.path !== ".")
    let targetPath = opts.path ?? ".";
    const args = names.filter((n) => n != null && String(n).trim());
    const looksLikePath = (s: string) =>
      s === "." || s === ".." || s === "~" || s.includes("/") || s.includes("\\");
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
    const userScope = opts.user ?? targetPath === "~";
    const addPath = userScope ? "~" : targetPath;
    const dryRun = (opts.dryRun ?? false) || isReadOnlyEnv();
    let failed = 0;
    for (const name of args) {
      if (!name.trim()) continue;
      if (!runAdd(name, addPath, userScope, dryRun)) failed++;
    }
    process.exit(failed > 0 ? 1 : 0);
  });

program
  .command("scaffold <name>")
  .description(
    "Create a new guardrail skeleton in .agents/guardrails/<name>/GUARDRAIL.md (or user-level when --user is set)"
  )
  .option("-p, --path <path>", "Target directory", ".")
  .option("-u, --user", "Create in user-level ~/.agents/guardrails/")
  .option("--scope <scope>", "Scope: global, project, or session", "project")
  .option(
    "--severity <severity>",
    "Severity: critical, warning, or advisory",
    "warning"
  )
  .option("-n, --dry-run", "Show what would be created without writing")
  .action(function (
    this: {
      opts: () => {
        path?: string;
        user?: boolean;
        scope?: string;
        severity?: string;
        dryRun?: boolean;
      };
    },
    name: string
  ) {
    const opts = this.opts();
    const userScope = opts.user ?? opts.path === "~";
    const projectPath = opts.path ?? ".";
    const readOnlyEnv = isReadOnlyEnv();
    const dryRun = (opts.dryRun ?? false) || readOnlyEnv;

    const scope =
      opts.scope === "global" || opts.scope === "session" || opts.scope === "project"
        ? (opts.scope as "global" | "project" | "session")
        : "project";
    const severity =
      opts.severity === "critical" || opts.severity === "advisory" || opts.severity === "warning"
        ? (opts.severity as "critical" | "warning" | "advisory")
        : "warning";

    const ok = runScaffold(name, {
      projectPath,
      userScope,
      scope,
      severity,
      dryRun,
    });
    process.exit(ok ? 0 : 1);
  });

program
  .command("upgrade [path]")
  .description("Update installed guardrails to latest template versions")
  .option("-n, --dry-run", "Show what would be updated without writing")
  .option("-d, --diff", "Show diff for each updated guardrail")
  .option("-u, --user", "Upgrade user-level ~/.agents/guardrails/")
  .action(function (this: { opts: () => { dryRun?: boolean; diff?: boolean; user?: boolean } }, path?: string) {
    const opts = this.opts();
    const p = path ?? ".";
    const userScope = opts.user ?? p === "~";
    const dryRun = (opts.dryRun ?? false) || isReadOnlyEnv();
    runUpgrade(userScope ? "~" : p, dryRun, opts.diff, userScope);
  });

program
  .command("diff [path]")
  .description("Show diff between installed guardrails and latest templates (alias for upgrade --dry-run --diff)")
  .option("-u, --user", "Diff user-level ~/.agents/guardrails/")
  .action(function (this: { opts: () => { user?: boolean } }, path?: string) {
    const opts = this.opts();
    const p = path ?? ".";
    const userScope = opts.user ?? p === "~";
    runUpgrade(userScope ? "~" : p, true, true, userScope);
  });

program
  .command("remove <name> [path]")
  .description("Remove a guardrail from .agents/guardrails/")
  .option("-u, --user", "Remove from user-level ~/.agents/guardrails/")
  .option("-n, --dry-run", "Show what would be removed without writing")
  .action(function (this: { opts: () => { user?: boolean; dryRun?: boolean } }, name: string, path?: string) {
    const opts = this.opts();
    const p = path ?? ".";
    const userScope = opts.user ?? p === "~";
    const dryRun = (opts.dryRun ?? false) || isReadOnlyEnv();
    const ok = runRemove(name, userScope ? "~" : p, userScope, dryRun);
    process.exit(ok ? 0 : 1);
  });

program
  .command("setup [path]")
  .description("Add the guardrail rule to Cursor, Claude Code, VS Code Copilot, Windsurf, Continue, JetBrains (required until IDEs support guardrails natively)")
  .option("-r, --remove", "Remove the guardrail rule from IDE configs")
  .option("-p, --pre-commit", "Add guardrails check to pre-commit hook (Husky or pre-commit)")
  .option("-i, --ide <name>", "Target IDE: cursor, claude, copilot, windsurf, continue, jetbrains, junie, or auto")
  .option("-n, --dry-run", "Show what would be added/removed without writing files")
  .option("-c, --check", "Show which IDEs are configured and whether they have the rule")
  .option("--fail-if-missing", "Exit 1 if any configured IDE lacks the rule (use with --check, for CI)")
  .action(function (this: { opts: () => { remove?: boolean; preCommit?: boolean; ide?: string; dryRun?: boolean; check?: boolean; failIfMissing?: boolean } }, path?: string) {
    const p = path ?? ".";
    const opts = this.opts();
    const readOnlyEnv = isReadOnlyEnv();
    const dryRun = (opts.dryRun ?? false) || readOnlyEnv;
    if (opts.preCommit) {
      const result = runSetupPreCommit(p, opts.remove ?? false, dryRun);
      console.log(result.message);
      return;
    }
    if (opts.check) {
      const check = runSetupCheck(p);
      const fmt = (name: string, r: { configured: boolean; hasRule: boolean }) => {
        const status = !r.configured ? "not configured" : r.hasRule ? "has rule" : "no rule";
        const color = !r.configured ? chalk.gray : r.hasRule ? chalk.green : chalk.yellow;
        console.log(`  ${name.padEnd(22)} ${color(status)}`);
      };
      console.log("IDE setup status:");
      fmt("Cursor", check.cursor);
      fmt("Claude Code", check.claude);
      fmt("VS Code Copilot", check.copilot);
      fmt("Windsurf", check.windsurf);
      fmt("Continue", check.continue);
      fmt("JetBrains AI Assistant", check.jetbrains);
      fmt("JetBrains Junie", check.junie);
      if (opts.failIfMissing) {
        const ides = [check.cursor, check.claude, check.copilot, check.windsurf, check.continue, check.jetbrains, check.junie];
        const configuredWithoutRule = ides.filter((r) => r.configured && !r.hasRule);
        if (configuredWithoutRule.length > 0) {
          console.error(chalk.red("\nSome configured IDEs lack the guardrail rule. Run `npx guardrails-ref setup` to fix."));
          process.exit(1);
        }
      }
      return;
    }
    const validIdes = ["cursor", "claude", "copilot", "windsurf", "continue", "jetbrains", "junie", "auto"];
    const ide = opts.ide as IdeName | "auto" | undefined;
    if (ide && !validIdes.includes(ide)) {
      console.error(chalk.red("Invalid --ide. Use: cursor, claude, copilot, windsurf, continue, jetbrains, junie, or auto"));
      process.exit(1);
    }
    const result = opts.remove
      ? runSetupRemove(p, ide as IdeName | "all" | "auto" | undefined, dryRun)
      : runSetup(p, ide as IdeName | "all" | "auto" | undefined, dryRun);
    console.log(result.message);
  });

program
  .command("why <name>")
  .description("Show guardrail content (e.g. npx guardrails-ref why no-destructive-commands)")
  .option("-j, --json", "Output as JSON")
  .action(function (this: { opts: () => { json?: boolean } }, name: string) {
    const opts = this.opts();
    const ok = runWhy(name, opts.json);
    process.exit(ok ? 0 : 1);
  });

program
  .command("list [path]")
  .description("List discovered guardrails")
  .option("-j, --json", "Output as JSON")
  .option("-c, --compact", "One name per line (for scripting)")
  .option("-u, --user", "List user-level ~/.agents/guardrails/")
  .action(function (this: { opts: () => { json?: boolean; compact?: boolean; user?: boolean } }, path?: string) {
    const opts = this.opts();
    const userScope = opts.user ?? path === "~";
    const pathToScan = userScope ? resolveGuardrailsDir("~", true) : (path ?? ".");
    const guardrails = listGuardrails(pathToScan);

    if (opts.json) {
      console.log(JSON.stringify({ guardrails, total: guardrails.length }, null, 2));
      process.exit(guardrails.length === 0 ? 1 : 0);
      return;
    }

    if (opts.compact) {
      for (const g of guardrails) console.log(g.name);
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

async function main(): Promise<void> {
  try {
    await program.parseAsync();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red("Unexpected error in guardrails-ref:"), message);
    process.exit(1);
  }
}

void main();
