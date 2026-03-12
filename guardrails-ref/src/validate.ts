import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import matter from "gray-matter";
import { parseGuardrailFile, type ParseResult, type ParsedGuardrail } from "./parse.js";

/** Canonical frontmatter key order for normalization */
const FRONTMATTER_KEY_ORDER = [
  "name",
  "description",
  "scope",
  "severity",
  "triggers",
  "license",
  "metadata",
];

const GUARDRAIL_FILENAMES = ["GUARDRAIL.md", "GUARDRAILS.md"];
const MAX_DEPTH = 6;
const MAX_DIRS = 2000;

export interface ValidateResult {
  valid: number;
  invalid: number;
  total: number;
  results: Array<{
    path: string;
    success: boolean;
    errors: string[];
    warnings: string[];
    guardrail?: ParsedGuardrail;
  }>;
}

function findGuardrailFiles(dir: string, depth = 0, count = { dirs: 0 }): string[] {
  if (depth > MAX_DEPTH || count.dirs > MAX_DIRS) {
    return [];
  }

  const files: string[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      const fullPath = join(dir, entry.name);
      if (entry.isFile()) {
        if (GUARDRAIL_FILENAMES.includes(entry.name)) {
          files.push(fullPath);
        }
      } else if (entry.isDirectory()) {
        count.dirs++;
        files.push(...findGuardrailFiles(fullPath, depth + 1, count));
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

export function validatePath(inputPath: string): ValidateResult {
  const resolved = resolve(inputPath);
  const results: ValidateResult["results"] = [];
  let valid = 0;
  let invalid = 0;

  let filesToValidate: string[] = [];

  try {
    const stat = statSync(resolved);
    if (stat.isFile()) {
      const filename = resolved.split(/[/\\]/).pop() || "";
      if (GUARDRAIL_FILENAMES.includes(filename)) {
        filesToValidate = [resolved];
      } else {
        results.push({
          path: resolved,
          success: false,
          errors: [`Not a guardrail file (expected GUARDRAIL.md or GUARDRAILS.md): ${filename}. Hint: Use GUARDRAIL.md in a subdir or GUARDRAILS.md at root.`],
          warnings: [],
        });
        invalid++;
      }
    } else if (stat.isDirectory()) {
      filesToValidate = findGuardrailFiles(resolved);
    }
  } catch {
    results.push({
      path: resolved,
      success: false,
      errors: ["Path does not exist or is not accessible. Hint: Check the path and run from project root."],
      warnings: [],
    });
    invalid++;
  }

  for (const filePath of filesToValidate) {
    const parseResult: ParseResult = parseGuardrailFile(filePath);
    results.push({
      path: filePath,
      success: parseResult.success,
      errors: parseResult.errors,
      warnings: parseResult.warnings,
      guardrail: parseResult.guardrail,
    });
    if (parseResult.success) {
      valid++;
    } else {
      invalid++;
    }
  }

  return {
    valid,
    invalid,
    total: valid + invalid,
    results,
  };
}

/**
 * Build frontmatter object with keys in canonical order. Extra keys go after, sorted.
 */
function normalizeFrontmatterKeys(data: Record<string, unknown>): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (const key of FRONTMATTER_KEY_ORDER) {
    if (key in data) {
      ordered[key] = data[key];
      seen.add(key);
    }
  }
  const extra = Object.keys(data).filter((k) => !seen.has(k)).sort();
  for (const key of extra) {
    ordered[key] = data[key];
  }
  return ordered;
}

/**
 * Apply fixes to a guardrail file: trim trailing whitespace per line, ensure single trailing newline,
 * and normalize frontmatter key order (name, description, scope, severity, triggers, license, metadata).
 * Returns true if file was modified.
 */
export function fixGuardrailFile(filePath: string): boolean {
  const content = readFileSync(filePath, "utf-8");
  let parsed: { data: Record<string, unknown>; content: string };
  try {
    parsed = matter(content);
  } catch {
    // Invalid frontmatter: only apply whitespace fix
    const lines = content.split("\n");
    const fixed = lines.map((l) => l.replace(/\s+$/, "")).join("\n").trimEnd();
    const normalized = fixed + "\n";
    if (content !== normalized) {
      writeFileSync(filePath, normalized);
      return true;
    }
    return false;
  }
  const body = parsed.content.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trimEnd();
  const orderedData = normalizeFrontmatterKeys(parsed.data);
  // lineWidth: -1 prevents js-yaml from folding long lines (reduces format churn)
  const normalized = matter.stringify(body, orderedData, { lineWidth: -1 } as Record<string, unknown>);
  const withNewline = normalized.endsWith("\n") ? normalized : normalized + "\n";
  if (content !== withNewline) {
    writeFileSync(filePath, withNewline);
    return true;
  }
  return false;
}

export function listGuardrails(inputPath: string): Array<{ path: string; name: string; description: string }> {
  const validateResult = validatePath(inputPath);
  const guardrails: Array<{ path: string; name: string; description: string }> = [];

  for (const r of validateResult.results) {
    if (r.success && r.guardrail) {
      guardrails.push({
        path: r.guardrail.path,
        name: r.guardrail.name,
        description: r.guardrail.description,
      });
    }
  }

  return guardrails;
}
