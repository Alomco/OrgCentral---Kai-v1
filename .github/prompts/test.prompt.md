---
description: Generate, run, and diagnose tests with focused coverage recommendations.
tools:
  - codebase
  - search
  - editFiles
  - runCommands
  - problems
---

# /test

## Request
$ARGUMENTS

## Goal

Create or run tests with clear scope, deterministic assertions, and actionable failures.

## Modes

- `/test`: run existing test suite.
- `/test <target>`: generate tests for target area.
- `/test coverage`: summarize coverage and high-risk gaps.
- `/test fix`: debug and fix failing tests.

## Procedure

1. Detect test framework and existing patterns.
2. Define cases: happy path, validation, error, edge conditions.
3. Add or update tests with minimal brittle mocking.
4. Execute tests and summarize failures with root cause hints.

## Output

```markdown
## Test Report
- Mode:
- Target:

## Added/Updated Tests
- [path]

## Results
- passed:
- failed:

## Failure Analysis
1. ...

## Next Actions
1. ...
```
