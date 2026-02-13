---
description: Investigate and fix defects with evidence-first debugging.
tools:
  - codebase
  - search
  - editFiles
  - runCommands
  - problems
---

# /debug

## Issue
$ARGUMENTS

## Goal

Find root cause, implement minimal fix, and reduce recurrence risk.

## Procedure

1. Reproduce the issue and capture exact symptoms.
2. Form 2-4 hypotheses ranked by likelihood.
3. Test hypotheses with concrete evidence (logs, stack traces, code paths).
4. Implement smallest safe fix for confirmed root cause.
5. Add or suggest tests/guards to prevent regression.

## Output

```markdown
## Debug Report
- Symptom:
- Reproduction:

## Hypotheses
1. ...
2. ...

## Investigation Evidence
- [file:line] finding
- command output summary

## Root Cause
- ...

## Fix Applied
- [file:line] change summary

## Regression Prevention
- tests/guards added:

## Validation
- npx tsc --noEmit:
- pnpm lint --fix:
- tests:
```
