# Gap: Unified notifications inbox

## Legacy reference (old project)
- old/src/app/(app)/notifications/page.tsx
- old/src/context/NotificationContext.tsx

## New project status (orgcentral)
- Notifications UI is limited to HR at orgcentral/src/app/(app)/hr/notifications/page.tsx
- No cross-module inbox with bulk actions

## Impact
- Users cannot manage all system, HR, and finance notifications in one place.

## TODO
- [ ] Define unified notification schema and category taxonomy across modules.
- [ ] Implement inbox controllers with read/unread, bulk actions, and filters.
- [ ] Build inbox UI with filters, bulk actions, and category tabs.
- [ ] Wire preferences to delivery and inbox visibility (mute/subscribe).
- [ ] Add tests for notification lifecycle and permissions.
