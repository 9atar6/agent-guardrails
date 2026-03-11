---
name: no-raw-sql
description: Never use raw SQL with string concatenation or unparameterized queries. Use parameterized queries or ORMs. Apply when writing database queries.
scope: project
severity: critical
triggers:
  - "Writing SQL"
  - "Database queries"
  - "SELECT"
  - "INSERT"
  - "UPDATE"
  - "DELETE"
  - "String concatenation in SQL"
license: MIT
metadata:
  author: agent-guardrails
  version: "1.0"
---

# No Raw SQL

## Trigger
Writing database queries, SQL statements, or any code that executes SQL against a database.

## Instruction
- Never build SQL with string concatenation or template literals that include user input
- Always use parameterized queries, prepared statements, or ORM methods (e.g. Prisma, SQLAlchemy, Knex)
- For raw SQL: use `?` placeholders, `$1, $2`, or the framework's parameter API
- Never interpolate variables directly into SQL strings (SQL injection risk)

## Reason
Raw SQL with string concatenation leads to SQL injection. Parameterized queries prevent injection and are required for security.
