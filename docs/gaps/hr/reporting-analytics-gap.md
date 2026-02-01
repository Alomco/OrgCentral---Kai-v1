# Gap: HR reporting and analytics parity

## Current wiring (orgcentral)
- HR reports page and metrics:
  - orgcentral/src/app/(app)/hr/reports/page.tsx
  - orgcentral/src/app/(app)/hr/reports/reports-utils.ts
- HR dashboard analytics surfaces:
  - orgcentral/src/app/(app)/hr/dashboard/page.tsx
  - orgcentral/src/app/(app)/hr/dashboard/_components/kpi-grid.tsx
  - orgcentral/src/app/(app)/hr/dashboard/_components/manager-snapshot.tsx
- HR admin dashboard stats and quick actions:
  - orgcentral/src/app/(app)/hr/admin/page.tsx
  - orgcentral/src/app/(app)/hr/admin/actions.ts
  - orgcentral/src/app/(app)/hr/admin/_components/hr-admin-quick-actions.tsx
  - Manager snapshot currently shows team leave approvals, absences, timesheets, and anniversaries.

## Legacy capabilities (old project)
- HR dashboard included document-expiry and compliance KPIs for employees/managers:
  - old/src/app/(app)/hr/dashboard/page.tsx
- HR admin center highlighted "HR Reports & Analytics" entry and live pending counts from hubs:
  - old/src/app/(app)/hr/admin/page.tsx

## Scope notes
- This gap owns HR reporting surfaces, admin stats wiring, and exports.
- Compliance reporting data sources are tracked in `orgcentral/docs/gaps/hr/compliance-gap.md`.
- Document vault metadata and expiry signals are tracked in `orgcentral/docs/gaps/documents/document-management-gap.md`.

## Gaps (new project only)
1) Document/compliance KPIs are missing from HR analytics surfaces.
   - Old dashboard surfaced "Documents Expiring" and "Compliance" tiles; new HR dashboard omits those signals and manager snapshot does not include them.
2) HR reports do not include compliance or document-expiry metrics, despite compliance workflows being core in the old dashboard.
3) HR admin reporting visibility is reduced and stats are placeholders.
   - New admin quick actions do not link to reports, and `getAdminDashboardStats`/`getPendingApprovals` return placeholder values.
   - Old admin center exposed a reports entry and live pending counts from hubs.
4) HR admin reporting visibility is not linked to reports from the admin dashboard quick actions.
   - New admin quick actions omit reports; old admin center exposed a reports entry.
5) Cross-module reporting is missing - no comprehensive reporting connecting data from different modules (e.g., how training affects performance).
6) Advanced analytics capabilities are missing - no predictive analytics, trend analysis, or workforce planning tools.
7) Export functionality for reports is limited or missing - no comprehensive export options for employee data or analytics.

## TODOs
- [x] Analyze and restore document-expiry/compliance KPIs in HR dashboards and reports (compare old HR dashboard to new KPI surfaces).
- [x] Analyze and add compliance/document-expiry metrics to HR reports aggregation (tie into compliance data sources).
- [x] Analyze and wire HR admin reporting visibility plus real pending/stats data (reports link + non-placeholder stats).
- [x] Analyze and link HR admin quick actions to HR reports with role-appropriate routing.
- [x] Implement cross-module reporting capabilities that connect data from different modules.
- [ ] Add advanced analytics features including trend analysis and predictive capabilities.
- [x] Implement comprehensive export functionality for reports and employee data.

## Related gaps
- orgcentral/docs/gaps/documents/document-management-gap.md
- orgcentral/docs/gaps/hr/compliance-gap.md
- orgcentral/docs/gaps/comprehensive-feature-gap-analysis.md

## Implementation Status (as of 2026-02-01)

| # | Gap | Status | Notes |
|---|-----|--------|-------|
| 1 | Document/Compliance KPIs in HR dashboard | ⚠️ PARTIAL | Compliance + expiring KPIs added; document vault expiry still pending |
| 2 | Document/Compliance metrics in HR reports | ⚠️ PARTIAL | Compliance KPIs added; document vault expiry still pending |
| 3 | HR Admin stats - real data | ✅ CLOSED | Pending approvals + compliance/upcoming expirations wired |
| 4 | HR Admin pending approvals | ✅ CLOSED | Pending approvals populated across HR modules |
| 5 | HR Admin quick actions → Reports link | ✅ CLOSED | Reports entry present in quick actions |
| 6 | Cross-module reporting | ✅ CLOSED | Cross-module insights section added to reports |
| 7 | Advanced analytics | ❌ OPEN | No predictive or trend analysis capabilities |
| 8 | Report export functionality | ✅ CLOSED | CSV/JSON export endpoint wired |

### Priority Recommendations
1. **High effort:** Create document-expiry use-case and add KPI tiles from document vault metadata
2. **High effort:** Add advanced analytics and predictive capabilities
