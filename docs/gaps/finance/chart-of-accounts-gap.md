# Gap: Finance chart of accounts

## Legacy reference (old project)
- old/src/app/(app)/finance/chart-of-accounts/page.tsx

## New project status (orgcentral)
- No /finance route under orgcentral/src/app

## Impact
- No chart of accounts UI for finance operations.

## TODO
- [ ] Define chart of accounts schema (hierarchy, types, normal balance) and import strategy.
- [ ] Implement CRUD controllers with validation, audit logging, and lock-period support.
- [ ] Build UI for account hierarchy management and mapping.
- [ ] Integrate with reporting/ledger to enforce account usage.
- [ ] Add tests for permissions and data integrity.
