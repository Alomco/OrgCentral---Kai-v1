---
agent: Describe what to build next
description: Orchestrate complex tasks using multiple specialist perspectives in Copilot Chat.
tools:
  - codebase
  - search
  - runCommands
  - editFiles
  - problems
---

# Parallel Agents (Copilot Chat)

Use this prompt when the task needs multiple specialist viewpoints (for example: security + backend + frontend + testing), not for small single-file fixes.

## Task
$ARGUMENTS

## Operating Rules

1. Treat this as orchestration, not single-pass implementation.
2. Use at least 3 specialist lenses for complex work.
3. Keep findings evidence-based with file references.
4. Prioritize by severity: Critical, High, Medium, Low.
5. End with a unified execution plan and verification checklist.

## Specialist Lenses

- `Explorer`: map relevant files, boundaries, dependencies.
- `Security`: auth, tenant isolation, input validation, secret/PII leakage.
- `Backend`: APIs, contracts, error handling, data consistency.
- `Frontend`: state flow, UX regressions, loading/error states, accessibility.
- `Database`: schema alignment, query safety, indexing risks.
- `Testing`: missing coverage, regression risk, deterministic checks.
- `Performance`: hot paths, unnecessary fetches/renders, heavy operations.

Pick only the lenses needed by the task, but never fewer than 3 for large/critical requests.

## Orchestration Protocol

### Phase 1: Scope and Decomposition

1. Restate the task in one sentence.
2. Identify affected domains.
3. Choose specialist lenses and explain why each is needed.

### Phase 2: Parallel Analysis Passes

For each selected lens:

1. Inspect relevant files with codebase/search tools.
2. Produce concrete findings with file references.
3. Suggest minimal fixes and likely side effects.

### Phase 3: Synthesis

Combine all lens outputs into one consolidated result:

1. Deduplicate overlapping findings.
2. Resolve conflicts between recommendations.
3. Produce one prioritized action list.

### Phase 4: Execution Plan

Provide a plan with:

1. Small, reversible change batches.
2. Validation steps after each batch.
3. Rollback notes for risky changes.

## Output Template

```markdown
## Orchestration Summary
- Task:
- Domains:
- Lenses used:

## Findings (by severity)
### Critical
- [file:line] issue, impact, fix

### High
- [file:line] issue, impact, fix

### Medium
- [file:line] issue, impact, fix

## Consolidated Fix Plan
1. Batch 1:
2. Batch 2:
3. Batch 3:

## Verification
1. Typecheck:
2. Lint:
3. Tests:
4. Runtime checks:

## Residual Risks
- ...
```

## When Not to Use This Prompt

- Tiny one-file changes.
- Straightforward syntax or lint fixes.
- Questions that only need one domain.
