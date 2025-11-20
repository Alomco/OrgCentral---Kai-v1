# OrgCentral Frontend Migration Playbook

Purpose: copy the mature frontend that lives in `old/` into the fresh `orgcentral/` workspace without losing modularity or performance. Every numbered task can be assigned to a dedicated AI agent so work happens in parallel.

## Guiding Pillars
- **Granular islands** – replicate the `(app)` and `(auth)` route groups as isolated “islands.” Keep each segment under 250 LOC, introduce new child folders instead of enlarging existing files, and only add `"use client"` where interaction is mandatory.
- **SOLID-first modules** – treat every context, hook, and UI primitive as a single-responsibility unit. Inject dependencies (API clients, stores, schemas) via props or factory functions so components remain open for extension but closed for modification.
- **Cached components** – embrace Next.js 16 Cache Components: wrap stable fetches with `use cache`, declare cache scopes via `cacheLife({ mode: "public", maxAge: 60 })`, and surface cache tags per tenant for reliable revalidation.
- **Partial Prerendering (PPR)** – prefer PPR for dynamic routes such as dashboards and HR tables. Define static shells with `generateStaticParams`, stream data regions with Suspense boundaries, and mark low-latency widgets as interactive islands.
- **Next.js 16 tools** – keep `next dev --turbo` + Next DevTools open to inspect route islands, cache hits, flight payload size, and hydration timelines. Use the built-in Route Analyzer, `next lint --max-warnings=0`, and the MCP runtime hooks for automated diagnostics.

---

## Phase 0 – Environment & Source Audit
1. **Dependency + runtime sync**  
   - Confirm `next@16`, React 19, Tailwind v4, and `better-auth` are installed (already true in `orgcentral`).  
   - Enable Cache Components globally in `next.config.ts` if not already set (`experimental.cacheComponents = true`).
2. **DevTools & MCP wiring**  
   - Run `pnpm dev -- --experimental-devtools` to expose the Next.js 16 DevTools overlay.  
   - Verify MCP endpoint by calling `/_next/mcp` and cataloging the available runtime tools for later automation.
3. **Old repo inventory**  
   - Export a manifest of `old/src/app`, `old/src/components`, `old/src/lib`, and `old/src/context` using `tree` or `findstr`.  
   - Tag each artifact with its tenant-awareness requirement (needs `orgId`? needs `complianceTier`?).

## Phase 1 – Global Shell & Providers
1. **App layout + metadata**  
   - Port `old/src/app/layout.tsx`, `globals.css`, and font/theme setup into `orgcentral/src/app`.  
   - Split global CSS by concern (base, tokens, utilities) to keep files <250 LOC.  
   - Replace any legacy head tags with Next 16 `Metadata` exports.
2. **Providers island**  
   - Move `providers.tsx`, `FullCalendarWrapper.tsx`, React Query/TanStack providers, and context wrappers under `src/app/providers.tsx`.  
   - Convert heavy providers (theme, notifications) into cacheable server components that expose lightweight client shims.
3. **Cross-cutting hooks**  
   - Recreate `BrandingContext`, `NotificationContext`, and `UserContext` in `orgcentral/src/context` with SOLID boundaries (context = interface, provider = implementation).  
   - Ensure contexts consume data through injected fetchers wrapped with Cache Components.

## Phase 2 – Shared UI & Utility Layers
1. **UI primitives**  
   - Copy `old/src/components/ui` into `orgcentral/src/components/ui`, auditing each component for `use client` necessity.  
   - Refactor to use Tailwind v4 tokens and `class-variance-authority` for variants.  
   - Expose composable stories/tests per component.
2. **Layout + navigation**  
   - Bring over sidebars, top bars, breadcrumbs from `old/src/components/layout`.  
   - Define each structural piece as its own island (`SidebarIsland`, `NavRailIsland`), streaming data (notifications count, tasks) through PPR slots.
3. **Shared logic + libs**  
   - Port `src/lib/utils.ts`, `src/lib/storage.ts`, `src/lib/firebase/*`, HR helpers, and ensure they follow SOLID (pure functions, no singletons).  
   - Replace any direct Firebase calls with injected repositories accessible through server actions backed by Cache Components.

## Phase 3 – Authentication Surfaces ( `(auth)` island )
1. **Folder scaffolding**  
   - Recreate `(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`, `(auth)/verify-email` using server components + minimal client bridges.  
   - Move validation schemas into `src/lib/validation/auth.ts`, injecting them into forms.
2. **Better Auth integration**  
   - Wire each action to `better-auth` flows, caching provider metadata where possible.  
   - Use PPR for static sections (background art, testimonials) and interactive islands for forms.
3. **Security hardening**  
   - Implement tenant-aware redirects, ensuring every auth page respects `orgId` query params.  
   - Add Next 16 Route Handlers under `src/app/api/auth/*` only when client interactions require dynamic data.

## Phase 4 – Core App Domain Islands
For each domain, follow the same sub-steps: **(a)** scaffold route island under `src/app/(app)/<domain>`, **(b)** port feature components from `old/src/components/<domain>`, **(c)** wrap data loaders inside Cache Components + Suspense, **(d)** expose client-only interactions via child islands.

1. **Dashboard**  
   - Split hero KPIs, charts, timelines, and notifications into separate streaming sections so PPR can render the skeleton immediately.  
   - Instrument with Next DevTools to ensure each island hydrates under 1s.
2. **Admin**  
   - Port org/member management tables, inviting flows, and role editors.  
   - Introduce SOLID service objects for permissions, injecting them via context to avoid tightly coupling UI to ACL logic.  
   - Cache member lists per tenant with `cacheTag(["org", orgId])` and invalidate on mutations.
3. **HR**  
   - Recreate employee directory, PTO calendar, and review workflows inside `src/app/(app)/hr`.  
   - Use `FullCalendarWrapper` as its own client island fed by a cache component delivering events.  
   - Stream long-running queries (e.g., payroll history) with nested Suspense boundaries.
4. **Finance**  
   - Bring budgeting dashboards and invoicing tables.  
   - Convert ledger fetches into Cache Components using `cacheLife({ mode: "private", maxAge: 30 })`.  
   - PPR static invoice shells, hydrate details once sensitive data is fetched server-side.
5. **Notifications**  
   - Port list/detail views plus composer UI.  
   - Implement granular islands for filters, timeline, composer modal.  
   - Tag notification queries for cache invalidation tied to the Notification Center.
6. **Profile & Settings**  
   - Separate personal profile, security, integrations, and branding settings into discrete route segments.  
   - Keep each settings panel under 200 LOC and rely on SOLID form services for validation and submission.  
   - Where data rarely changes (e.g., theme presets), use static Cache Components so pages qualify for full PPR.

## Phase 5 – Data, Actions, and Performance Enhancements
1. **Server Actions + mutations**  
   - Move every form submission to server actions stored under `src/app/(app)/**/actions.ts`.  
   - Ensure each action revalidates cache tags that back the affected views.
2. **Streaming & suspense choreography**  
   - Standardize a `SkeletonIsland` component library for streaming placeholders.  
   - Use nested Suspense boundaries instead of a single global fallback to keep islands granular.
3. **Observability + DevTools**  
   - Configure Next DevTools Performance tab for each key route, capturing screenshots of hydration/CPU metrics.  
   - Annotate problematic components in this doc (or an issue tracker) with action items for remediation.

## Phase 6 – QA, Accessibility, and Sign-off
1. **Automated checks**  
   - Run `pnpm lint`, `pnpm test`, `pnpm depcheck`, and `pnpm knip` for dead code after each phase.  
   - Add route-level Lighthouse runs using Next DevTools or `next devtools analyze` to verify PPR and cache hits.
2. **Manual verification**  
   - Use multiple tenant fixtures to ensure `orgId` boundaries remain intact.  
   - Validate keyboard flows and screen-reader output for every interactive island.
3. **Handoff artifacts**  
   - Update this playbook with completion notes per task.  
   - Produce ADRs summarizing any SOLID or caching deviations for future reviewers.

> ✅ **Assignment Tip:** Because you plan to use multiple AI agents, treat each numbered task (e.g., "Phase 4 · Admin") as a ticket. Provide the agent with:
> - The source folder in `old/`
> - The destination in `orgcentral/`
> - The relevant pillar emphasis (island granularity, SOLID, caching, PPR, tooling)
> - Acceptance criteria (tests, lint, DevTools trace)

Following this plan will reproduce the old frontend inside OrgCentral while keeping the new Next.js 16 stack performant, composable, and easy to reason about.