---
name: tools-permissions
description: Restrict agents to approved tools and require explicit approval or policies for high-risk actions (deletes, refunds, external calls).
scope: project
severity: critical
triggers:
  - "Adding or modifying agent tools or actions"
  - "Integrating external APIs that can change or delete data"
  - "Introducing automation that can affect money, security, or production systems"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Tool Permissions & High-Risk Actions

## Trigger
You are defining or modifying the tools / actions an agent can call, especially those that can change or delete data, issue refunds, send emails, call admin APIs, or otherwise impact money, security, or production systems.

## Instruction
- Always maintain an explicit **allow list** of tools the agent may call (e.g. `search`, `read_file`, `summarize`).
- Deny or require **human approval** for high-risk tools that can:
  - delete data (e.g. `delete_database`, `drop_table`, `truncate_table`)
  - change access control or credentials
  - move money or issue refunds above a small threshold
  - send emails or messages to end users in bulk
- For each high-risk tool, define a policy in code or config:
  - required parameters (e.g. `reason`, `amount`, `ticket_id`)
  - maximum amount / scope (e.g. `maxAmount: 200`)
  - whether human approval is required (e.g. `requireConfirmation: true`)
- Never allow the agent to construct or call arbitrary tools by name (no dynamic `toolName` from user input).
- Log every high-risk tool call (even when blocked) to an **audit log** with reason, parameters, and guardrail decision.

## Reason
An internal “helper” agent was given access to tools that could delete customer data and issue refunds. A prompt injection convinced the agent to run destructive tools outside of intended use. There was no explicit allow list, no thresholds, and no approval step for high-risk actions, so the agent executed them without friction.

By enforcing an explicit allow list, adding guardrails around high-risk tools, and requiring human approval or strict policies, you reduce the blast radius of agent mistakes and prompt injection attempts.

## Provenance
Manual addition based on common “too-powerful tools” incidents in agent systems.

