---
description: Summarize project, task, and runtime status for the current workspace.
tools:
  - codebase
  - search
  - runCommands
  - problems
---

# /status

## Context
$ARGUMENTS

## Goal

Return a concise status board for progress, risks, and next actions.

## Procedure

1. Summarize active scope and impacted areas.
2. Report current progress (completed, in-progress, blocked).
3. Include runtime/preview status when available.
4. Highlight critical risks and required decisions.

## Optional Commands

```bash
python .github/scripts/session_manager.py status
python .github/scripts/auto_preview.py status
```

## Output

```markdown
## Project Status
- Scope:
- Progress:

## Work Board
- Completed:
- In Progress:
- Blocked:

## Runtime
- Preview URL:
- Health:

## Risks
1. ...

## Next Actions
1. ...
```
