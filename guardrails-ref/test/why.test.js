import { test } from "node:test";
import assert from "node:assert";
import { runWhy } from "../dist/why.js";

test("runWhy: shows guardrail content for known name", () => {
  const ok = runWhy("no-plaintext-secrets");
  assert.ok(ok);
});

test("runWhy: unknown guardrail returns false", () => {
  const ok = runWhy("nonexistent-guardrail-xyz");
  assert.ok(!ok);
});

test("runWhy: normalizes name (spaces to hyphens)", () => {
  const ok = runWhy("no plaintext secrets");
  assert.ok(ok);
});
