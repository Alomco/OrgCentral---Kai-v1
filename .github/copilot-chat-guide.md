# Copilot Chat Guide (OrgCentral)

Use this guide to work with the Copilot Chat assets in .github.

## Where to look first

- Agents: .github/agents/
- Skills: .github/skills/
- Workflows: .github/workflows/
- Prompts: .github/prompts/
- Rules: .github/rules/copilot-chat.md

## Current Copilot Chat format (Feb 2026)

- Always-on instructions: .github/copilot-instructions.md
- Optional instructions: .github/instructions/*.instructions.md (applyTo patterns)
- Agents: .github/agents/*.md (custom agents; .agent.md is supported but not required)
- Prompt files: .github/prompts/*.prompt.md
- Skills: .github/skills/<skill>/SKILL.md

## How to use agents

- Pick the closest agent file for the task domain.
- Read its front matter and referenced skills.
- Follow the skill instructions before editing code.

## Diagnostics and settings to verify

- Diagnostics: Chat view > right-click > Diagnostics (lists loaded agents, prompts, instructions, skills)
- Required settings: github.copilot.chat.codeGeneration.useInstructionFiles, chat.useAgentsMdFile, chat.useAgentSkills
- Optional settings: chat.useNestedAgentsMdFiles, chat.promptFilesLocations, chat.agentFilesLocations, chat.agentSkillsLocations
- If instructions do not apply: enable chat.includeApplyingInstructions and chat.includeReferencedInstructions

## How to use skills

- Skills load on demand when the task matches the skill description.
- Read SKILL.md first, then only the relevant sections.
- Run the referenced scripts via .github/skills/<skill>/scripts/ when needed.

## How to use workflows

- Workflows are runbook-style instructions.
- Follow the workflow steps in order.
- For planning, create a {task-slug}.md in the project root.

## Orchestration basics

- Use the orchestrator for multi-domain tasks.
- Run at least three specialist passes for complex work.
- Synthesize into one plan with validation steps.
- Allow subagents to perform small edits in addition to analysis tasks.

## Verification

- Core checks: python .github/scripts/checklist.py .
- Full suite: python .github/scripts/verify_all.py . --url http://localhost:3000

