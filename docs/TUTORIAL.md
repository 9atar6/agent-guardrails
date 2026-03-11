# Agent Guardrails: A Beginner's Tutorial

**Never used guardrails before? Start here.** This tutorial explains what we built, why it matters, and how to use it — in plain language.

> **Required for now:** IDEs don't recognize guardrails yet. You must add this one-liner to your Cursor rules or Claude instructions:  
> `You MUST read and follow all constraints in .agents/guardrails/. Never violate a guardrail without explicit human approval.`

---

## Part 1: The Problem

### You're coding with AI (Cursor, Claude Code, etc.)

You ask the AI to add Stripe payments to your app. It writes code, runs it, hits an error, tries again. Maybe it works. You close the chat.

**Next week**, you ask it to add logging for debugging. The AI adds `console.log(apiKey)` to help you trace a bug. It doesn't know that last week you told it never to log secrets. It has no memory. It just helped you leak your Stripe key.

### AI agents don't remember

- They don't remember what went wrong last time
- They don't remember your project's rules
- They repeat the same mistakes across sessions
- When things go wrong, they sometimes spiral (trying the same broken approach over and over)

### You need a way to say "never do this"

You need a **persistent file** that the AI reads at the start of every session. A file that says: "Here are the things you must NEVER do in this project."

That file is a **guardrail**.

---

## Part 2: What We Built

### In one sentence

**Agent Guardrails** = a standard file format (`GUARDRAIL.md`) that tells AI coding agents what they must NOT do. The file lives in your project, gets read at session start, and persists across every chat.

### The analogy

| Concept | What it does |
|---------|--------------|
| **Skills** (SKILL.md) | "Here's HOW to do X" — e.g. "How to process PDFs" |
| **Guardrails** (GUARDRAIL.md) | "Here's what you must NOT do" — e.g. "Never log API keys" |

Skills = capabilities. Guardrails = constraints.

### What's in a guardrail file?

1. **Metadata** (YAML at the top) — name, description, when it applies
2. **Instructions** (Markdown below) — the actual rules, in a structure called "Signs":
   - **Trigger** — when does this rule apply? (e.g. "when adding logging")
   - **Instruction** — what must the AI do or avoid?
   - **Reason** — why does this rule exist?

### Why a file format?

- **Portable** — works across Cursor, Claude Code, VS Code, etc. (once they support it)
- **Version controlled** — lives in git with your code
- **Team shared** — everyone gets the same constraints
- **Machine readable** — tools can validate and parse it

---

## Part 3: A Real Example

### Scenario: "Add Stripe to my app"

**Without guardrails:** The AI might:
- Put your test API key in the code
- Log the key for "debugging"
- Commit it to git

**With a guardrail** (e.g. `no-plaintext-secrets`):

The AI reads at session start: *"Never log, commit, or expose API keys. Use environment variables."*

When you ask it to add Stripe, it:
- Uses `process.env.STRIPE_KEY` instead of hardcoding
- Skips logging the key
- Tells you to add the key to `.env` (and not commit it)

The guardrail doesn't teach it *how* to use Stripe — a skill could do that. It tells the AI *what to avoid*.

---

## Part 4: Create Your First Guardrail

### Option A: One command (easiest)

From your project root:

```bash
npx guardrails-ref init
```

This creates `.agents/guardrails/`, adds the `no-plaintext-secrets` example, and runs setup. Skip to Step 3 to validate.

Use `npx guardrails-ref init --minimal` to create `.agents/guardrails/` only (no example, no setup).

### Option B: Manual

### Step 1: Create the folder

In your project root:

```bash
mkdir -p .agents/guardrails
```

### Step 2: Create a GUARDRAIL.md file

Create `.agents/guardrails/no-plaintext-secrets/GUARDRAIL.md`:

```markdown
---
name: no-plaintext-secrets
description: Never log, commit, or expose API keys, passwords, or tokens.
scope: project
severity: critical
---

# No Plaintext Secrets

## Trigger
Adding logging, implementing auth, or integrating third-party APIs.

## Instruction
- Never store, log, or commit plaintext credentials
- Use environment variables or secrets managers
- Use a redactSensitive() helper when logging objects

## Reason
Secrets in logs or git lead to security incidents and key rotation.
```

### Step 3: Validate it

From your project directory:

```bash
npx guardrails-ref validate .
```

(From the `agent-guardrails` repo: `npm run validate`.)

You should see: `✓ .../no-plaintext-secrets/GUARDRAIL.md` and `Valid: 1/1`.

### Step 4: Add the one-liner (required for now)

IDEs don't automatically load guardrails yet. Run this from your project directory:

```bash
npx guardrails-ref setup
```

This adds the rule to Cursor (`.cursor/rules/`), Claude Code (`.claude/instructions.md`), and VS Code Copilot (`.github/copilot-instructions.md`) automatically. Without it, your guardrails won't work.

Use `npx guardrails-ref setup --dry-run` to preview changes, or `npx guardrails-ref setup --ide auto` to only configure IDEs that already have config files.

**Or copy-paste manually** into Cursor rules, `.claude/instructions.md`, or `.github/copilot-instructions.md`:
```
You MUST read and follow all constraints in .agents/guardrails/. Never violate a guardrail without explicit human approval.
```

Once IDEs add native support, this step won't be needed.

---

## Part 5: Common Guardrails to Add

| Guardrail | What it prevents |
|-----------|------------------|
| **no-plaintext-secrets** | Logging or committing API keys, passwords |
| **no-placeholder-credentials** | Fake or placeholder API keys instead of asking for real values |
| **no-silent-error-handling** | Catching errors without surfacing them to the user |
| **require-access-control** | Exposing sensitive data or admin actions without role checks |
| **database-migrations** | Changing the database schema directly instead of using migrations |
| **no-destructive-commands** | Running `rm -rf`, `DROP TABLE`, `TRUNCATE` without explicit approval |
| **no-new-deps-without-approval** | Adding npm/pip packages without human confirmation |
| **no-hardcoded-urls** | Hardcoding API URLs, base URLs, endpoints |
| **no-sudo-commands** | Running sudo/su/root commands without explicit approval |
| **rate-limiting** | Making thousands of API calls in a loop (e.g. Stripe test mode only, max N calls) |
| **no-console-in-production** | Adding console.log in production code |
| **require-tests** | Merging code without tests |
| **prefer-existing-code** | Reimplementing when existing code or helpers exist |
| **no-inline-styles** | Inline `style=` in HTML/JSX |
| **no-raw-sql** | Raw SQL without parameterization |
| **no-magic-numbers** | Unexplained numeric literals |
| **no-modifying-git-history** | `git push --force`, destructive rebase without approval |
| **no-deprecated-apis** | Suggesting deprecated or obsolete APIs |
| **no-unsafe-env-assumptions** | Assuming env vars exist without validation |
| **no-hardcoded-user-facing-strings** | Hardcoded labels, messages, errors in UI |

Copy from `examples/` or run `npx guardrails-ref add <name>` to add any example. Use `npx guardrails-ref add --list` to see all available. Use `npx guardrails-ref why <name>` to show a guardrail's full content before adding.

---

## Part 6: How It All Fits Together

```
Your project
├── .agents/
│   ├── guardrails/           ← "Don't do these things"
│   │   ├── no-plaintext-secrets/
│   │   │   └── GUARDRAIL.md
│   │   └── database-migrations/
│   │       └── GUARDRAIL.md
│   └── skills/               ← "Here's how to do these things" (optional)
│       └── pdf-processing/
│           └── SKILL.md
├── .cursor/rules             ← "Read the guardrails"
└── your-code/
```

**Session start:** AI reads your rules → sees "read .agents/guardrails/" → loads all GUARDRAIL.md files → now knows the constraints.

**During chat:** You ask for a feature. The AI follows both its general knowledge and your guardrails. It won't suggest logging your API key.

---

## Part 7: What We Built (Summary)

| Piece | What it is |
|-------|------------|
| **Spec** (`spec/specification.md`) | The formal definition of the GUARDRAIL.md format |
| **Validator** (`guardrails-ref`) | A CLI that checks your guardrail files are valid |
| **Examples** (`examples/`) | Ready-to-use guardrails you can copy |
| **Client guide** (`spec/client-implementation.md`) | Instructions for IDE vendors to add native support |

**You** write GUARDRAIL.md files. The **validator** checks them. Your **AI IDE** (once it supports the spec) loads them at session start. Your **team** gets consistent safety rules across every chat.

---

## Next Steps

1. Copy an example: `cp -r examples/no-plaintext-secrets .agents/guardrails/`
2. Run `npx guardrails-ref setup` (adds the one-liner to Cursor, Claude Code, and VS Code Copilot)
3. Start a new chat and ask the AI to add logging — it should avoid logging secrets
4. Add more guardrails as you discover patterns you want to prevent
5. Remove a guardrail with `npx guardrails-ref remove <name>` if you no longer need it

Questions? See the [specification](../spec/specification.md) for the full format, or [examples](../examples/) for more guardrails.
