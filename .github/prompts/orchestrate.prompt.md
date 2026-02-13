---
description: Coordinate multiple specialist agents for cross-domain tasks.
tools:
  - codebase
  - search
  - editFiles
  - runCommands
  - problems
---

# /orchestrate

## Request
$ARGUMENTS

## Goal

Use multi-agent orchestration only when cross-domain analysis or implementation is necessary.

## Rules

1. Subagents are stateless; pass full context each time.
2. Delegate only bounded tasks.
3. Use only the number of agents required by scope (typically 2-4).
4. Synthesize outputs into one coherent result.

## Procedure

1. Decompose scope into domains.
2. Select specialist agents per domain.
3. Run independent passes in parallel where safe.
4. Resolve conflicting recommendations.
5. Produce one integrated plan and execution summary.

## Output

```markdown
## Orchestration Report
- Scope:
- Domains:
- Agents used:

## Findings
1. ...
2. ...

## Consolidated Plan
1. ...
2. ...

## Validation
- npx tsc --noEmit:
- pnpm lint --fix:
- tests/checklist:
```
