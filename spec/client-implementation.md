# How to add guardrails support to your agent

> A guide for adding Agent Guardrails support to an AI agent or development tool.

This guide walks through how to add guardrails support to an AI agent or development tool. It covers discovery, parsing, injection into the system prompt, and precedence handling.

Prerequisites: Familiarity with the [Agent Guardrails specification](./specification.md), which defines the `GUARDRAIL.md` file format and directory conventions.

## Core principle: load at session start

Unlike Agent Skills (which load on task match), guardrails must be loaded at **session start**. Constraints need to be active from the beginning so the agent never operates without awareness of what it must NOT do.

| Tier | What's loaded | When | Token cost |
|------|---------------|------|------------|
| 1. Catalog | Name + description | Session start | ~50-100 tokens per guardrail |
| 2. Full content | Complete GUARDRAIL.md body | Session start | ~200-500 tokens each |

## Step 1: Discover guardrails

At session startup, find all available guardrails and load their content.

### Where to scan

Scan at least two scopes:

- **User-level** (relative to home directory): Guardrails available across all projects
- **Project-level** (relative to working directory): Guardrails specific to the current project

| Scope | Path | Purpose |
|-------|------|---------|
| Project | `./.agents/guardrails/` | Cross-client interoperability |
| Project | `./GUARDRAILS.md` | Single file at project root |
| User | `~/.agents/guardrails/` | User-level constraints |

The `.agents/guardrails/` paths are the cross-client convention. Scanning these means guardrails installed by other compliant clients are visible to yours.

Some implementations also scan client-specific paths (e.g. `.cursor/guardrails/`, `.claude/guardrails/`) for compatibility.

### What to scan for

Within each guardrails directory, look for:

1. **Subdirectories** containing a file named exactly `GUARDRAIL.md`
2. **Root file** `GUARDRAILS.md` at project root

```
~/.agents/guardrails/
├── no-plaintext-secrets/
│   └── GUARDRAIL.md          ← discovered
├── database-migrations/
│   └── GUARDRAIL.md          ← discovered
└── README.md                 ← ignored

./GUARDRAILS.md               ← discovered (project root)
```

Practical scanning rules:

- Set reasonable bounds (e.g. max depth 4-6, max 2000 directories)
- Skip `.git/`, `node_modules/`, and similar
- Optionally respect `.gitignore`

### Handling name collisions

When two guardrails share the same `name`:

- **Project-level overrides user-level** (universal convention)
- Within the same scope, use deterministic precedence (first-found or last-found) and log a warning

### Trust considerations

Project-level guardrails come from the repository, which may be untrusted (e.g. freshly cloned). Consider gating project-level guardrail loading on a trust check — only load if the user has marked the project as trusted.

## Step 2: Parse GUARDRAIL.md files

For each discovered file, extract the metadata and body content.

### Frontmatter extraction

A `GUARDRAIL.md` file has two parts: YAML frontmatter between `---` delimiters, and a Markdown body after the closing delimiter.

1. Find the opening `---` at the start and the closing `---` after it
2. Parse the YAML block. Extract `name` and `description` (required), plus optional fields
3. Everything after the closing `---`, trimmed, is the body content

See the [specification](./specification.md) for the full set of frontmatter fields.

### Lenient validation

Warn on issues but load when possible:

- YAML completely unparseable → skip the guardrail, log the error
- Description missing or empty → skip (essential for context)
- Name exceeds 64 characters → warn, load anyway
- Name doesn't match parent directory → warn, load anyway

### Malformed YAML

Values containing colons may break YAML parsing:

```yaml
# Technically invalid
description: Use when: the user adds logging
```

Consider a fallback that wraps such values in quotes before retrying.

## Step 3: Inject into system prompt

Add guardrail content to the system prompt at session start.

### What to inject

Include the full content of each guardrail (frontmatter + body, or body only). The agent needs the complete instructions to understand and enforce constraints.

### Behavioral instructions

Precede the guardrail content with a short instruction block:

```
The following guardrails define constraints you must never violate without explicit human approval.
Read and follow all constraints in the guardrails below. Never bypass a guardrail.
```

### Structured wrapping (optional)

For context management, wrap guardrail content in identifying tags:

```xml
<guardrail name="no-plaintext-secrets" severity="critical">
# No Plaintext Secrets

## Trigger
Implementing authentication, adding logging...

## Instruction
Never store, log, or commit plaintext credentials...

## Reason
API keys were exposed in 2025 audit.
</guardrail>
```

This helps:
- Identify guardrail content during context compaction
- Preserve guardrails when truncating older messages

## Step 4: Protect from context compaction

If your agent truncates or summarizes older messages when the context window fills:

- **Exempt guardrail content from pruning** — constraints are durable behavioral guidance
- Use the structured tags from Step 3 to identify and preserve guardrail content
- Losing guardrails mid-conversation silently degrades safety without visible errors

## Step 5: Cloud-hosted and sandboxed agents

If your agent runs in a container or on a remote server:

- **Built-in guardrails**: Package as static assets in the deployment artifact
- **User-level**: Provision from external source (config repo, settings, upload)
- **Project-level**: If the agent operates on a cloned repo, project guardrails travel with the code and can be scanned from the repo's directory tree

## Summary

1. **Discover** guardrails at session start from `.agents/guardrails/` and `GUARDRAILS.md`
2. **Parse** YAML frontmatter + Markdown body with lenient validation
3. **Inject** full content into system prompt with behavioral instructions
4. **Protect** guardrail content from context compaction
5. **Precedence**: Project overrides user; apply trust checks for project-level guardrails
