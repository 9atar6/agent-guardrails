import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { parseGuardrailFile, type ParseResult, type ParsedGuardrail } from "./parse.js";

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
          errors: [`Not a guardrail file (expected GUARDRAIL.md or GUARDRAILS.md): ${filename}`],
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
      errors: ["Path does not exist or is not accessible"],
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
