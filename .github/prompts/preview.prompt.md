---
description: Manage local preview lifecycle (start, stop, restart, status).
tools:
  - runCommands
  - problems
---

# /preview

## Command
$ARGUMENTS

## Goal

Control local preview server and report actionable status.

## Commands

- `/preview`: show status
- `/preview start [port]`: start preview
- `/preview stop`: stop preview
- `/preview restart [port]`: restart preview
- `/preview check`: run health check

## Script

```bash
python .github/scripts/auto_preview.py status
python .github/scripts/auto_preview.py start 3000
python .github/scripts/auto_preview.py stop
```

## Output

```markdown
## Preview Status
- URL:
- Process:
- Port:
- Health:
- Notes:
```
