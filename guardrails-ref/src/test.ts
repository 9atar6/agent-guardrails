import chalk from "chalk";
import { listGuardrails } from "./validate.js";
import { resolveGuardrailsDir } from "./path-utils.js";

type TestCheck = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
};

type CategoryId =
  | "presence"
  | "secrets"
  | "destructive"
  | "tools"
  | "runtime"
  | "quality"
  | "prompt";

const CHECK_CATEGORIES: Record<string, CategoryId> = {
  "guardrails-present": "presence",
  "secrets-present": "secrets",
  "destructive-commands-present": "destructive",
  "rate-limiting-present": "runtime",
  "tools-permissions-present": "tools",
  "default-preset-core-present": "quality",
  "no-prompt-leaks-present": "prompt",
  "logging-standards-present": "quality",
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
      id: "secrets-present",
      label: "Secrets guardrail installed (no-plaintext-secrets)",
      ok: names.has("no-plaintext-secrets"),
      hint: "Consider `npx guardrails-ref add no-plaintext-secrets` to prevent logging or committing credentials.",
    },
    {
      id: "destructive-commands-present",
      label: "Destructive commands guardrail installed (no-destructive-commands)",
      ok: names.has("no-destructive-commands"),
      hint: "Consider `npx guardrails-ref add no-destructive-commands` to guard against `rm -rf`, `DROP TABLE`, `TRUNCATE`.",
    },
    {
      id: "rate-limiting-present",
      label: "Runaway loop / rate-limiting guardrail installed (rate-limiting)",
      ok: names.has("rate-limiting"),
      hint: "Consider `npx guardrails-ref add rate-limiting` to limit tool calls and API loops.",
    },
    {
      id: "tools-permissions-present",
      label: "Tool permissions / high-risk tools guardrail installed (tools-permissions)",
      ok: names.has("tools-permissions"),
      hint: "Consider `npx guardrails-ref add tools-permissions` to require policies for destructive tools.",
    },
    {
      id: "default-preset-core-present",
      label: "Core default preset guardrails installed (no-plaintext-secrets, no-destructive-commands, no-new-deps-without-approval, require-commit-approval)",
      ok:
        names.has("no-plaintext-secrets") &&
        names.has("no-destructive-commands") &&
        names.has("no-new-deps-without-approval") &&
        names.has("require-commit-approval"),
      hint:
        "Consider `npx guardrails-ref add --preset default` to install core guardrails for secrets, destructive commands, new deps, and commits.",
    },
    {
      id: "no-prompt-leaks-present",
      label: "Prompt leak guardrail installed (no-prompt-leaks)",
      ok: names.has("no-prompt-leaks"),
      hint: "Consider `npx guardrails-ref add no-prompt-leaks` to prevent leaking internal prompts and guardrails.",
    },
    {
      id: "logging-standards-present",
      label: "Logging standards guardrail installed (require-logging-standards)",
      ok: names.has("require-logging-standards"),
      hint: "Consider `npx guardrails-ref add require-logging-standards` to enforce structured, safe logging.",
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;

  const categoryKeys = Array.from(new Set(Object.values(CHECK_CATEGORIES)));
  const categories = categoryKeys.map((cat) => {
    const catChecks = checks.filter((c) => CHECK_CATEGORIES[c.id] === cat);
    const catTotal = catChecks.length;
    const catPassed = catChecks.filter((c) => c.ok).length;
    return {
      id: cat,
      totalChecks: catTotal,
      passed: catPassed,
      failed: catTotal - catPassed,
      score: catTotal === 0 ? null : `${catPassed}/${catTotal}`,
    };
  });

  const scorePercent = total === 0 ? 0 : Math.round((passed / total) * 100);
  const attackLabels: Record<CategoryId, string> = {
    presence: "Guardrails installed",
    secrets: "Secret leak",
    destructive: "Destructive commands",
    tools: "Tool abuse",
    runtime: "Runaway loops",
    quality: "Code quality",
    prompt: "Prompt leak",
  };
  const attackCoverage = categoryKeys.map((cat) => {
    const catChecks = checks.filter((c) => CHECK_CATEGORIES[c.id] === cat);
    const covered = catChecks.length > 0 && catChecks.every((c) => c.ok);
    return { attack: attackLabels[cat], covered };
  });

  const summary = {
    path: pathToScan,
    totalChecks: total,
    passed,
    failed: total - passed,
    score: `${passed}/${total}`,
    scorePercent,
    attackCoverage,
    categories,
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
  console.log(`Safety score: ${passed}/${total} (${scorePercent}%)`);

  process.exit(exitCode);
}

