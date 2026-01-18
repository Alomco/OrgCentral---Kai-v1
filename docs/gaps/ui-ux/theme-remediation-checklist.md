# Theme remediation checklist

## App shell and navigation
- [ ] Replace header gradients and shadows with theme tokens and UI surface variables.
  - orgcentral/src/components/layout/app-header.module.css
- [ ] Replace sidebar gradients, hover states, and header styling with theme tokens and UI surface variables.
  - orgcentral/src/components/layout/app-sidebar.module.css
- [ ] Align user menu popover colors (background, borders, text, hover) with theme tokens.
  - orgcentral/src/components/layout/user-nav.tsx

## Core theme switching
- [ ] Ensure theme switcher button styling uses theme tokens only and is consistent with popovers.
  - orgcentral/src/components/theme/theme-switcher.tsx
- [ ] Verify UI style preset changes affect shell surfaces, not just component surfaces.
  - orgcentral/src/components/theme/ui-style-provider.tsx
  - orgcentral/src/styles/ui-styles.css
  - orgcentral/src/styles/ui-surfaces.css

## Auth and onboarding surfaces
- [ ] Replace auth layout gradients and fixed slate palette with theme tokens.
  - orgcentral/src/components/auth/AuthLayout.tsx
- [ ] Replace auth form controls using fixed slate/indigo colors with theme-aware styles.
  - orgcentral/src/components/auth/AdminBootstrapForm.tsx
  - orgcentral/src/components/auth/LoginForm.base.tsx
- [ ] Align landing theme toggle with tenant theme and UI style presets.
  - orgcentral/src/components/landing/components/ThemeToggle.tsx

## Dashboard surfaces
- [ ] Replace dashboard background gradients with theme tokens.
  - orgcentral/src/app/(app)/dashboard/page.tsx
- [ ] Replace dashboard hero card palettes with theme-aware surfaces.
  - orgcentral/src/app/(app)/dashboard/_components/dashboard-hero.tsx
- [ ] Replace dashboard widget card and skeleton gradients with theme-aware surfaces.
  - orgcentral/src/app/(app)/dashboard/_components/dashboard-widget-card.tsx
  - orgcentral/src/app/(app)/dashboard/_components/dashboard-widget-skeleton.tsx

## HR module surfaces
- [ ] Convert KPI card accent colors to theme-aware tokens.
  - orgcentral/src/app/(app)/hr/dashboard/_components/kpi-grid.tsx
- [ ] Convert quick action cards and icon backgrounds to theme-aware tokens.
  - orgcentral/src/app/(app)/hr/dashboard/_components/quick-actions-enhanced.tsx
- [ ] Convert HR status badges, indicators, and stat cards to theme-aware status tokens.
  - orgcentral/src/app/(app)/hr/_components/hr-status-badge.tsx
  - orgcentral/src/app/(app)/hr/_components/hr-design-system/status-indicator.tsx
  - orgcentral/src/app/(app)/hr/_components/hr-design-system/stat-card.tsx
- [ ] Convert absence status colors and calendar indicators to theme-aware status tokens.
  - orgcentral/src/app/(app)/hr/absence/_components/absence-detail-dialog.tsx
  - orgcentral/src/app/(app)/hr/absence/_components/absence-calendar.tsx
- [ ] Convert report breakdown bar colors to theme-aware status tokens.
  - orgcentral/src/app/(app)/hr/reports/_components/status-breakdown-card.tsx
- [ ] Convert leave request switch styling (border, thumb) to theme-aware neutrals.
  - orgcentral/src/app/(app)/hr/leave/_components/leave-request-form.dates.tsx

## Shared components
- [ ] Replace hard-coded input and select focus/hover colors with theme tokens.
  - orgcentral/src/components/ui/form-fields.tsx
- [ ] Replace notification priority stripes with theme-aware status tokens.
  - orgcentral/src/components/notifications/notification-item.tsx
- [ ] Replace success/warning/info badge colors with theme-aware tokens.
  - orgcentral/src/components/theme/primitives/interactive.tsx

## Related gaps
- orgcentral/docs/gaps/ui-ux/theme-ui-switching-gap.md
- orgcentral/docs/gaps/ui-ux/theme-accessibility-gap.md
