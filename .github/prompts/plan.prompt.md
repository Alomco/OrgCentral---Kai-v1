---
description: Produce a concise implementation plan before major code changes.
tools:
  - codebase
  - search
---

# /plan

## Request
$ARGUMENTS

## Goal

Create a practical implementation plan without writing code.

## Procedure

1. Clarify unknowns only if necessary.
2. Define scope, non-goals, risks, and assumptions.
3. Break work into dependency-ordered tasks.
4. Include verification commands and success criteria.
5. Save plan as `PLAN-{slug}.md` in project root.

## Output

```markdown
## Planning Report
- Plan file: PLAN-{slug}.md
- Scope:
- Risks:

## Task Breakdown
1. Task
2. Task
3. Task

## Verification
- npx tsc --noEmit
- pnpm lint --fix
- target tests/scripts

## Open Questions
1. ...
```
