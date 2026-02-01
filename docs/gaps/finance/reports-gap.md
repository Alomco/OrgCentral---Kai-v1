# Gap: Finance reports

## Legacy reference (old project)
- old/src/app/(app)/finance/reports/page.tsx

## New project status (orgcentral)
- No /finance route under orgcentral/src/app

## Impact
- No finance reporting dashboards or exports.

## TODO
- [ ] Define finance report set (P&L, balance sheet, cash flow) and filters.
- [ ] Implement reporting queries/aggregations with org scoping and export endpoints.
- [ ] Build reporting UI with date ranges, comparisons, and CSV/PDF export.
- [ ] Add caching/perf guardrails for heavy reports.
- [ ] Add tests for report accuracy and access control.
