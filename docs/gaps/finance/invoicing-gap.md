# Gap: Finance invoicing

## Legacy reference (old project)
- old/src/app/(app)/finance/invoicing/page.tsx

## New project status (orgcentral)
- No /finance route under orgcentral/src/app

## Impact
- No invoice creation, sending, or status tracking UI.

## TODO
- [ ] Define invoice model, statuses, templates, and tax/line-item rules.
- [ ] Implement invoicing controllers (create/send/update/pay) with Zod validation.
- [ ] Build UI for draft/issue/send flows with PDF preview.
- [ ] Integrate payment provider and notifications for due/paid/failed.
- [ ] Add tests for totals, status transitions, and permissions.
