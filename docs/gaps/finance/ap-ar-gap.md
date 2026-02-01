# Gap: Finance AP/AR management

## Legacy reference (old project)
- old/src/app/(app)/finance/ap-ar/page.tsx

## New project status (orgcentral)
- No /finance route under orgcentral/src/app

## Impact
- No accounts payable or receivable tracking UI.

## TODO
- [ ] Define AP/AR data model (vendors/customers, invoices, payments, aging) with classification.
- [ ] Implement AP/AR controllers with Zod validation, org scoping, and audit logs.
- [ ] Build AP/AR UI with status workflows and aging views.
- [ ] Integrate with GL and notifications for due/overdue items.
- [ ] Add tests for calculations, permissions, and exports.
