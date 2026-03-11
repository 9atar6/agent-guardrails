#!/usr/bin/env node
/**
 * Copies examples from the repo root into guardrails-ref for the published package.
 * Run before build so dist + examples are both available.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const examplesSrc = join(root, "..", "examples");
const examplesDest = join(root, "examples");

if (!existsSync(examplesSrc)) {
  console.error("copy-examples: ../examples not found. Run from agent-guardrails/guardrails-ref.");
  process.exit(1);
}

if (!existsSync(examplesDest)) {
  mkdirSync(examplesDest, { recursive: true });
}
cpSync(examplesSrc, examplesDest, { recursive: true });
console.log("copy-examples: copied examples to guardrails-ref/examples");
