---
trigger: always_on
---

# Workspace Rules - Copilot Chat

These rules define default behavior for VS Code Copilot Chat in this workspace.

## Priority

1. User request
2. Workspace rules (`.github/rules/copilot-chat.md`)
3. Agent file (`.github/agents/*.agent.md`)
4. Skill file (`.github/skills/*/SKILL.md`)

## Start-Up

Before implementation:

1. Read `.github/ARCHITECTURE.md`.
2. Read `.github/copilot-instructions.md`.
3. Select the closest specialist agent for the task domain.
4. Load only relevant skill sections.

## Request Routing

- `Question/explain`: answer directly.
- `Small single-file edit`: execute directly.
- `Complex multi-file change`: create or update a plan, then execute.
- `Multi-domain or explicit orchestration`: use `orchestrator` with bounded subagent tasks.

## Subagent Policy

- Subagents are stateless.
- Delegate only narrow tasks with full context.
- Use multi-agent only when it adds clear value.
- No fixed minimum number of subagents is required.

## Windows Execution Rules

- Default shell is PowerShell.
- Quote paths with spaces.
- Prefer `rg` for text and file search.
- Prefer workspace-relative paths in docs.

## Code Rules

- Keep files focused and generally below 250 LOC.
- Keep strict TypeScript; avoid `any` and `unknown` leakage.
- Keep ESLint strict; do not disable rules without approval.
- Centralize shared types/constants/config.
- Validate all boundary inputs (Zod for API/forms/actions).

## Security Rules

- Enforce tenant scoping (`orgId`, residency, classification).
- Apply least privilege and secure defaults.
- Do not log secrets or sensitive personal data.
- Keep adapters thin; delegate business logic to controllers/services.

## Next.js Rules

- Server Components first.
- Keep client islands minimal.
- Prefer React Query for server-state synchronization and invalidation.
- Use Zustand only for local client persistence.
- Avoid `router.refresh()` in client mutation flows.

## Workflow Rules

- If requirements are unclear, ask concise clarification questions first.
- If scope is clear, proceed without unnecessary ceremony.
- Keep changes minimal, reversible, and well-typed.

## Validation Rules

After code changes, run at minimum:

```bash
npx tsc --noEmit
pnpm lint --fix
```

Use extended validation when relevant:

```bash
python .github/scripts/checklist.py .
python .github/scripts/verify_all.py . --url http://localhost:3000
```

## File References

- Web UI/UX agent: `.github/agents/frontend-specialist.agent.md`
- Mobile UI/UX agent: `.github/agents/mobile-developer.agent.md`
