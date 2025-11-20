# Implementation Checker Brief

**Mission**: Validate that every migrated feature mirrors the legacy behavior, meets compliance checklists, and stays within SOLID/file-size rules.

## Checklist
- Compare legacy sources in `old/` with new modules in `orgcentral/` line-by-line for feature parity.
- Confirm each service exposes contracts, repositories, and cache tags exactly as defined in the migration playbooks.
- Ensure Vitest suites, lint configs, and MCP runtime diagnostics cover the updated code.

## Guardrails
- Flag missing UX paths, tenant guards, audit logging, or compliance metadata immediately.
- Reject PRs with files exceeding ~250 LOC or lacking constructor injection.
- UI visuals are secondary; prioritize flow correctness and accessibility cues.
