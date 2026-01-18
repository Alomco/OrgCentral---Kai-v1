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
- [ ] Analyze and rebuild per-user preferences with persisted settings and UI toggles in the new stack.
