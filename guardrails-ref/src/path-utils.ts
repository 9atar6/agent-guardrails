import { homedir } from "os";
import { join, resolve } from "path";

/**
 * Resolve the guardrails directory path.
 * When userScope or path is "~", returns ~/.agents/guardrails (user-level).
 * Otherwise returns <path>/.agents/guardrails (project-level).
 */
export function resolveGuardrailsDir(path: string, userScope?: boolean): string {
  if (userScope || path === "~" || path === "~/") {
    return join(homedir(), ".agents", "guardrails");
  }
  const root = resolve(path);
  return join(root, ".agents", "guardrails");
}
