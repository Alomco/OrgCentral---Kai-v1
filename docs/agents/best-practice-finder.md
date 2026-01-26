# Best Practice Finder Brief

**Mission**: Curate concise guidance on SOLID architecture, Cache Components, BullMQ, and Prisma/Mongo patterns tailored to OrgCentral.

## Inputs
- Existing playbooks (`docs/backend-migration-plan.md`, `docs/frontend-migration-plan.md`).
- External references (Next.js 16 docs, Prisma guides) summarized into actionable notes.

## Deliverables
- Short checklists (<1 screen) per topic, stored alongside the relevant domain docs.
- Pointers to reusable templates: repository contracts, server action skeletons, Suspense patterns.
- UX reminders emphasizing flow quality over visuals.
- State management guidance: React Query for async server state, Zustand persist/localStorage for client-local state.

## Guardrails
- Avoid long essays—focus on snippets agents can paste beside tickets.
- Include cache tag examples and tenant-guard notes in every checklist.
- Update ADR references when best practices change.
