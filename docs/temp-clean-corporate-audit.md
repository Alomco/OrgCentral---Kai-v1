# Clean Corporate Theme Audit (Temp)

Purpose: preserve context for follow-up fixes. Keep changes minimal, ESLint-safe, and theme switching performant.

## Current state (summary)
- Clean corporate is the default UI style and corporate slate is the default preset.
- UI style tokens/surfaces are split into modular files under `/styles/ui/cleanCorporateUi`.
- Theme primitives (cards/buttons/badges) still hardcode glass/gradient/neon variants.
- UI style is stored client-side only (localStorage), not tenant-scoped.
- Contrast audit only checks globals.css, not presets/overrides.

## Key files (entry points)
- Theme defaults: `src/server/theme/theme-presets.ts`, `src/app/globals.css`
- UI style presets: `src/server/theme/ui-style-presets.ts`, `styles/ui/cleanCorporateUi/ui-styles.css`
- Tenant theme SSR: `src/components/theme/tenant-theme-registry.tsx`
- Theme switcher: `src/components/theme/theme-switcher.tsx`
- Primitives: `src/components/theme/cards/theme-card.tsx`, `src/components/theme/primitives/interactive.tsx`
- Surface tokens: `styles/ui/cleanCorporateUi/ui-surfaces.css`
- Layout blur: `src/components/layout/app-header.module.css`
- Dialog overlay/backdrop: `src/components/ui/dialog.tsx`
- Contrast audit: `scripts/contrast-audit.ts`

## Issues impacting clean corporate
- Theme badges and status colors still use fixed semantic styles.
- UI style is stored client-side only (localStorage), not tenant-scoped.
- Contrast audit only checks globals.css, not presets/overrides.

## Phase TODO (short notes)
### P1: Baseline corporate defaults
- Add corporate color preset and make it default. (done)
- Switch default UI style to `clean-corporate`. (done)
- Align `globals.css` base tokens to corporate palette. (done)

### P2: Primitive conformance
- Refactor `ThemeCard` and `ThemeButton` variants to use `data-ui-surface` and UI style variables. (done)
- Remove hard-coded radii/gradient/glass from defaults. (done)
- Decide token mapping for `ThemeBadge` semantic variants (success/warning/info). (done)

### P3: Surface + overlay cleanup
- Replace fixed blur in header/dialog overlay with `--ui-backdrop-blur`. (done)
- Remove hard-coded translateY in `ui-surfaces.css`; use `--ui-hover-lift`. (done)
- Ensure reduced-motion and clean corporate disable glow/blur where required. (verify)

### P4: Tenant + performance
- Persist UI style per tenant (SSR via `TenantThemeRegistry`) instead of only localStorage. (done)
- Avoid extra client JS by using data attributes and CSS variables only.

### P5: Contrast and validation
- Extend `scripts/contrast-audit.ts` to test theme presets and overrides.
- Ensure all status/notification colors are token-based.

## Guardrails
- Keep files under 250 LOC.
- Strict TypeScript; no `any`/`unknown`.
- Do not disable ESLint rules.
- Use SSR + data attributes for theme switcher performance.
