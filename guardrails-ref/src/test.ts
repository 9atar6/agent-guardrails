import chalk from "chalk";
import { listGuardrails } from "./validate.js";
import { resolveGuardrailsDir } from "./path-utils.js";

type TestCheck = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
};

export function runTest(
  path: string | undefined,
  options: {
    user?: boolean;
    json?: boolean;
  }
): void {
  const userScope = options.user ?? path === "~";
  const pathToScan = userScope ? resolveGuardrailsDir("~", true) : (path ?? ".");
  const guardrails = listGuardrails(pathToScan);
  const names = new Set(guardrails.map((g) => g.name));

  const checks: TestCheck[] = [
    {
      id: "guardrails-present",
      label: "Guardrails discovered in project",
      ok: guardrails.length > 0,
      hint: "Run `npx guardrails-ref init` or `npx guardrails-ref add <name>` to add reference guardrails.",
    },
    {
      id: "rate-limiting-present",
      label: "Runaway loop / rate-limiting guardrail installed",
      ok: names.has("rate-limiting"),
      hint: "Consider `npx guardrails-ref add rate-limiting` to limit tool calls and API loops.",
    },
    {
      id: "tools-permissions-present",
      label: "Tool permissions / high-risk tools guardrail installed",
      ok: names.has("tools-permissions"),
      hint: "Consider `npx guardrails-ref add tools-permissions` to require policies for destructive tools.",
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;

  const summary = {
    path: pathToScan,
    totalChecks: total,
    passed,
    failed: total - passed,
    score: `${passed}/${total}`,
    checks: checks.map((c) => ({
      id: c.id,
      label: c.label,
      ok: c.ok,
      hint: c.ok ? undefined : c.hint,
    })),
  };

  const exitCode = passed === total ? 0 : 1;

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(exitCode);
    return;
  }

  console.log("Running Agent Guardrails tests...\n");
  for (const c of checks) {
    const mark = c.ok ? chalk.green("✓") : chalk.yellow("⚠");
    console.log(mark, c.label);
    if (!c.ok && c.hint) {
      console.log("   ", chalk.gray(c.hint));
    }
  }
  console.log();
  console.log(`Safety score: ${passed}/${total}`);

  process.exit(exitCode);
}

