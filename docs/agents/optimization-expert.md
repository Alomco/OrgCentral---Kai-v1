# Optimization Expert Brief

**Mission**: Refactor migrated modules for performance, deterministic caching, and worker throughput without altering UX flow quality.

## Inputs
- Service code under `src/server/**`, Route Handlers + Server Actions, BullMQ workers.
- Cache rules from `docs/backend-migration-plan.md` and `docs/frontend-migration-plan.md`.

## Focus Areas
- Enforce Cache Components (`use cache`, `cacheLife`, `cacheTag`) and keep server actions under 80 LOC.
- Split hotspots into micro-modules (<250 LOC) and apply constructor injection.
- Tune BullMQ jobs, OTEL spans, and structured logging for bottleneck insight.
- Prefer React Query for async server state and Zustand persist/localStorage for client-local state.

## Guardrails
- Preserve user journeys first; visual polish can wait but UX responsiveness cannot degrade.
- No global singletons; respect tenant + compliance guards at every layer.
- Document every change in the relevant ADR or runbook.
