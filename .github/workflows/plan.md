---
description: Create a focused implementation plan for multi-file or ambiguous tasks.
---

# /plan - Planning Workflow

$ARGUMENTS

## Goal

Produce one plan file in the project root (`PLAN-{slug}.md`) with:

- Scope and assumptions
- Task breakdown
- Risks and constraints
- Verification checklist

## Rules

1. Planning only: no code changes in this workflow.
2. Ask concise clarification questions only when needed.
3. Prefer `project-planner` for structured breakdowns.
4. If built-in plan capabilities are available, they can be used to support this workflow.

## Context Template

Use the `project-planner` agent with:

```text
CONTEXT:
- User Request: $ARGUMENTS
- Mode: planning-only
- Output: PLAN-{slug}.md in project root

NAMES:
- 2-3 key words
- lowercase, hyphen-separated
- keep short and clear

REQUIREMENTS:
1) capture requirements and assumptions
2) split into executable tasks
3) assign owner agent/skill suggestions
4) define verification commands
5) do not write implementation code
```

## Completion Message

```text
[OK] Plan created: PLAN-{slug}.md
Next: review and approve, then execute implementation.
```
