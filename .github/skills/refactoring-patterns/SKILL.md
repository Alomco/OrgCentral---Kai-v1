---
name: refactoring-patterns
description: Practical refactoring patterns for legacy or complex code. Use for safe restructuring, dependency cleanup, boundary extraction, and behavior-preserving code improvements.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
---

# Refactoring Patterns

## Purpose

Improve maintainability and clarity without changing intended behavior.

## When To Use

- Splitting oversized files/modules.
- Extracting reusable domain logic from route/UI glue code.
- Replacing duplicated logic with shared utilities/contracts.
- Migrating unsafe types to explicit domain types.

## Safe Refactor Sequence

1. Capture current behavior (tests or reproducible checks).
2. Isolate boundaries (I/O, adapters, side effects).
3. Perform one focused structural change at a time.
4. Keep public contracts stable during intermediate steps.
5. Re-run validation after each significant change.

## Common Patterns

- Extract Function / Extract Module
- Introduce Interface (DIP-friendly contracts)
- Separate Read vs Write paths
- Replace Primitive with Domain Type
- Move Validation to Boundary Layer

## Anti-Patterns

- Large mixed refactors with no verification gates.
- Changing behavior while claiming a pure refactor.
- Introducing new shared utilities without ownership boundaries.

## Verification

```bash
npx tsc --noEmit
pnpm lint --fix
```
