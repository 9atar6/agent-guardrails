import matter from "gray-matter";
import { readFileSync } from "fs";
import { resolve, dirname, basename } from "path";
import { debugLog } from "./debug.js";

export interface GuardrailFrontmatter {
  name: string;
  description: string;
  scope?: "global" | "project" | "session";
  severity?: "critical" | "warning" | "advisory";
  triggers?: string[];
  license?: string;
  metadata?: Record<string, string>;
}

export interface ParsedGuardrail {
  path: string;
  name: string;
  description: string;
  frontmatter: GuardrailFrontmatter;
  body: string;
}

const NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const VALID_SCOPES = new Set(["global", "project", "session"]);
const VALID_SEVERITIES = new Set(["critical", "warning", "advisory"]);

export interface ParseResult {
  success: boolean;
  guardrail?: ParsedGuardrail;
  errors: string[];
  warnings: string[];
}

export function parseGuardrailFile(filePath: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let content: string;
  try {
    debugLog("read", filePath);
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    return {
      success: false,
      errors: [`Cannot read file: ${filePath}. Hint: Check file exists and is readable.`],
      warnings: [],
    };
  }

  let parsed: { data: Record<string, unknown>; content: string };
  try {
    parsed = matter(content);
  } catch (err) {
    return {
      success: false,
        errors: [`Invalid YAML frontmatter: ${(err as Error).message}. Hint: Ensure valid YAML between --- delimiters.`],
      warnings: [],
    };
  }

  const data = parsed.data as Record<string, unknown>;
  const body = parsed.content.trim();

  // Required: name
  const name = data.name;
  if (typeof name !== "string" || !name.trim()) {
    errors.push("Missing or empty required field: name. Hint: Add `name: my-guardrail` to YAML frontmatter (lowercase, hyphens only).");
  } else {
    if (name.length > MAX_NAME_LENGTH) {
      warnings.push(`name exceeds ${MAX_NAME_LENGTH} characters`);
    }
    if (!NAME_REGEX.test(name)) {
      errors.push(
        "name must be lowercase letters, numbers, and hyphens only; no consecutive hyphens; cannot start or end with hyphen. Hint: Use format like `no-plaintext-secrets`."
      );
    }
  }

  // Required: description
  const description = data.description;
  if (typeof description !== "string" || !description.trim()) {
    errors.push("Missing or empty required field: description. Hint: Add `description: What this guardrail prevents` to YAML frontmatter.");
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    warnings.push(`description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  // Optional: scope
  const scope = data.scope;
  if (scope !== undefined) {
    if (typeof scope !== "string" || !VALID_SCOPES.has(scope)) {
      warnings.push(`scope must be one of: global, project, session`);
    }
  }

  // Optional: severity
  const severity = data.severity;
  if (severity !== undefined) {
    if (typeof severity !== "string" || !VALID_SEVERITIES.has(severity)) {
      warnings.push(`severity must be one of: critical, warning, advisory`);
    }
  }

  // Optional: triggers
  const triggers = data.triggers;
  if (triggers !== undefined) {
    if (!Array.isArray(triggers) || !triggers.every((t) => typeof t === "string")) {
      warnings.push("triggers must be a list of strings");
    }
  }

  // Check directory name matches (only when file is GUARDRAIL.md inside a directory, not GUARDRAILS.md at root)
  const parentDir = dirname(filePath);
  const dirName = basename(parentDir);
  const fileName = basename(filePath);
  if (fileName === "GUARDRAIL.md" && dirName && dirName !== "." && typeof name === "string" && name !== dirName) {
    warnings.push(`name "${name}" does not match parent directory "${dirName}". Hint: Rename directory to match, or set name to "${dirName}".`);
  }

  // Body structure hints (non-fatal)
  if (body.length > 0 && body.length < 40) {
    warnings.push(
      "Body content is very short. Hint: Include Trigger, Instruction, and Reason sections for best results."
    );
  }
  const hasTrigger = /##\s+Trigger\b/i.test(body);
  const hasInstruction = /##\s+Instruction\b/i.test(body);
  const hasReason = /##\s+Reason\b/i.test(body);
  if (!hasTrigger) {
    warnings.push(
      "Missing `## Trigger` section in body. Hint: Describe when this guardrail applies."
    );
  }
  if (!hasInstruction) {
    warnings.push(
      "Missing `## Instruction` section in body. Hint: Describe what the agent must do or must NOT do."
    );
  }
  if (!hasReason) {
    warnings.push(
      "Missing `## Reason` section in body. Hint: Explain why this guardrail exists."
    );
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings,
    };
  }

  const frontmatter: GuardrailFrontmatter = {
    name: (name as string).trim(),
    description: (description as string).trim(),
  };

  if (scope && typeof scope === "string" && VALID_SCOPES.has(scope)) {
    frontmatter.scope = scope as GuardrailFrontmatter["scope"];
  }
  if (severity && typeof severity === "string" && VALID_SEVERITIES.has(severity)) {
    frontmatter.severity = severity as GuardrailFrontmatter["severity"];
  }
  if (Array.isArray(triggers) && triggers.every((t) => typeof t === "string")) {
    frontmatter.triggers = triggers as string[];
  }
  if (data.license && typeof data.license === "string") {
    frontmatter.license = data.license;
  }
  if (data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)) {
    frontmatter.metadata = data.metadata as Record<string, string>;
  }

  return {
    success: true,
    guardrail: {
      path: resolve(filePath),
      name: frontmatter.name,
      description: frontmatter.description,
      frontmatter,
      body,
    },
    errors: [],
    warnings,
  };
}
