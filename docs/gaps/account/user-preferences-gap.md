# Gap: User preferences settings

## Legacy reference (old project)
- old/src/app/(app)/settings/page.tsx
- old/src/config/userSettings.ts

## New project status (orgcentral)
- /settings redirects to /org/settings, which is org-level
- No user preference panel for notifications, appearance, or locale

## Impact
- No per-user control for notification toggles, theme preference, language, or time zone.

## TODO
- [ ] Define preference schema (notifications, theme, locale, time zone) with org/user scoping and classification.
- [ ] Add preference read/update adapter controller with Zod validation, allowlists, and audit logging.
- [ ] Build account preferences UI (Server Component + useActionState) with toggles and selects.
- [ ] Wire preferences to theme/locale/notification delivery.
- [ ] Add tests for validation, persistence, and permission boundaries.
