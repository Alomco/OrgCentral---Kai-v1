---
description: Coordinate multiple specialist agents for genuinely multi-domain tasks.
---

# /orchestrate - Multi-Agent Workflow

$ARGUMENTS

## When To Use

- The request spans multiple domains (for example: backend + frontend + security).
- Work can run in parallel with low coupling.
- The user explicitly asks for multi-agent analysis.

For single-domain or small tasks, do not orchestrate; execute directly.

## Core Rules

1. Subagents are stateless; pass full context each time.
2. Delegate only small, bounded tasks.
3. Do not force a fixed minimum number of agents.
4. Prefer 2-4 agents based on scope.
5. Synthesize all outputs into one coherent result.

## Suggested Sequence

1. Scope and decomposition
2. Optional discovery pass (`explorer-agent`)
3. Parallel specialist passes (only where independent)
4. Consolidated synthesis
5. Verification pass

## Context Contract For Each Subagent

Always include:

- Original user request
- Constraints and non-negotiables
- Relevant files/findings already discovered
- Exact deliverable expected from that subagent

## Verification

Run only what matches the change scope. Typical baseline:

```bash
npx tsc --noEmit
pnpm lint --fix
```

Add project scripts when relevant:

```bash
python .github/scripts/checklist.py .
```

## Output Format

```markdown
## Orchestration Report

### Task
[summary]

### Agents Used
- [agent-name]: [bounded responsibility]

### Key Findings
1. ...

### Applied Changes
- ...

### Validation
- [command] -> [result]

### Risks / Follow-ups
- ...
```
