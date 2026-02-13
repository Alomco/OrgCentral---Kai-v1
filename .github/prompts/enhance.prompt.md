---
description: Extend an existing codebase with focused, reversible improvements.
tools:
  - codebase
  - search
  - editFiles
  - runCommands
  - problems
---

# /enhance

## Request
$ARGUMENTS

## Goal

Add or improve features in an existing project while preserving architecture and behavior.

## Procedure

1. Assess current implementation and affected boundaries.
2. Propose small change batches and expected side effects.
3. Implement with minimal churn and strict typing.
4. Verify related flows, not only modified files.
5. Summarize impact, migrations, and follow-ups.

## Rules

- Reuse existing shared types/config/utilities.
- Keep API adapters thin and validate inputs with schemas.
- Ensure notifications/workers/error paths remain correct after change.

## Output

```markdown
## Enhancement Report
- Scope:
- Affected areas:

## Changes
1. ...
2. ...

## Side Effects Checked
- ...

## Validation
- npx tsc --noEmit:
- pnpm lint --fix:
- tests:

## Follow-ups
1. ...
```
