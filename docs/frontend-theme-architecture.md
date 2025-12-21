# Frontend Theme Architecture

This document describes how OrgCentral drives tenant-specific design tokens across the new Next.js 16 stack.

## Goals
- **Scalable overrides** – tenants can replace any semantic token without changing component code.
- **SSR friendly** – tokens resolve on the server (with `cache`) so HTML ships with the correct palette and avoids hydration flashes.
- **Portable + type-safe** – token lists live in one module (`src/server/theme/tokens.ts`) and power CSS variables, Tailwind utilities, and runtime hooks.

## Key Files
| File | Purpose |
| --- | --- |
| `src/server/theme/tokens.ts` | Declares `ThemeTokenKey`, default tokens, and `TenantTheme` model. |
| `src/server/theme/get-tenant-theme.ts` | Cached async resolver; merge overrides from DB or service per `orgId`. |
| `src/components/theme/tenant-theme-registry.tsx` | Server component that injects a `<style>` tag with tenant tokens during SSR. |
| `src/app/layout.tsx` | Reads the `x-org-id` header, invokes the registry, and wraps the app tree so every route inherits the theme. |
| `src/app/globals.css` | Defines the base token CSS variables and helper utilities (scrollbar-hide, line-clamp) compatible with the legacy app. |

## Runtime Flow
1. Incoming request carries an `x-org-id` header (fallbacks to `default`).
2. `RootLayout` fetches the tenant theme using the cached `getTenantTheme` server helper.
3. `TenantThemeRegistry` renders a `<style>` tag that overrides `:root` variables before any component renders.
4. Components use semantic classes (`bg-card`, `text-muted-foreground`, etc.) or CSS variable references; Tailwind picks up the values automatically.

## Extending
- Replace the `mockThemeOverrides` object with a repository call (e.g., Prisma) and remember to invalidate cache tags when branding changes.
- Add new tokens by editing `themeTokenKeys` and updating `globals.css` defaults; TypeScript will force all call sites to provide values.
- If tenants require per-component fonts or spacing, add new keys in `themeTokenKeys` (e.g., `font-heading`).

## SSR & Performance
- `getTenantTheme` uses `react`'s `cache` helper so repeated calls per request don’t trigger duplicate fetches.
- Because the style tag renders on the server, there’s no client-side flicker when switching tenants.
- For client-side tenant switches, create a client action that invalidates the theme cache and triggers a soft navigation.
