---
name: database-migrations
description: Always use migration files for schema changes. Never modify production schema directly. Apply when modifying database schema, adding tables, or changing columns.
scope: project
severity: critical
triggers:
  - "Modifying database schema"
  - "Adding or changing tables"
  - "Database migrations"
  - "Prisma schema"
  - "SQL migrations"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# Database Migrations

## Trigger
Modifying database schema, adding tables, changing columns, or optimizing queries that affect schema.

## Instruction
- Always create a migration file (e.g. `prisma migrate dev`, `rails db:migrate`, or equivalent)
- Never modify production schema directly without a migration
- Test migrations in staging before applying to production
- Require explicit human approval before running migrations in production

## Reason
Direct schema changes caused 4-hour downtime and data inconsistencies. Migrations provide rollback capability and audit trail.

## Provenance
Manual addition, based on guardrails.md case study.
