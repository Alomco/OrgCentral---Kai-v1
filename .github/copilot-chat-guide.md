# Copilot Chat Guide (OrgCentral)

Use this guide to keep workspace instructions aligned with VS Code Copilot Chat on Windows.

## Source Of Truth

- Architecture: `.github/ARCHITECTURE.md`
- Always-on instructions: `.github/copilot-instructions.md`
- Global rules: `.github/rules/copilot-chat.md`
- Agents: `.github/agents/*.agent.md`
- Skills: `.github/skills/<skill>/SKILL.md`
- Prompt commands: `.github/prompts/*.prompt.md`
- Workflow runbooks (reference): `.github/workflows/*.md`

## Windows Baseline

- Default shell: PowerShell.
- Quote paths that include spaces.
- Prefer workspace-relative paths with `/` in docs (works on Windows and cross-platform).

## Agent Files

- Use `*.agent.md` for custom agents.
- Put YAML front matter at the very top of each file.
- Keep `name`, `description`, `tools`, and `skills` accurate.
- Keep delegated subagent tasks small and scoped because subagents are stateless.

## Skills

- Load only matching skills.
- Read `SKILL.md` first, then only relevant referenced sections.
- Use referenced scripts under `.github/skills/<skill>/scripts/` when needed.

## Workflows

- Prompt files in `.github/prompts/*.prompt.md` are what Copilot loads for command-style workflows.
- `.github/workflows/*.md` is retained as reference documentation and runbook detail.
- Use `/plan` for ambiguous or multi-file work.
- Use `/orchestrate` only when work is genuinely multi-domain.
- For straightforward tasks, execute directly without forced orchestration.

## Diagnostics

- In Copilot Chat, use Diagnostics to verify loaded instructions, agents, prompts, and skills.
- If instructions are not applying, verify agent mode and instruction files are enabled in VS Code settings.

## Validation

- Core checks: `python .github/scripts/checklist.py .`
- Full suite: `python .github/scripts/verify_all.py . --url http://localhost:3000`
