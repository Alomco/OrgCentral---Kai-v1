# Gap: HR onboarding flow parity

## Legacy behavior (old project)
- Multi-step wizard: identity, job/comp, assignments, review.
- Identity step captured first/last names and checked for:
  - existing employee record in org
  - existing OrgCentral auth user outside org with CTA to invite via user management
- Assignments step sourced leave types from org configuration.
- Onboarding checklist selection only from onboarding templates.
- Job/comp captured pay basis (annual/hourly) and pay schedule.

## Current behavior (orgcentral)
- Wizard exists at orgcentral/src/app/(app)/hr/onboarding/new/page.tsx.
- Department select is present but no departments are loaded in the page.
- Leave types default to a static list in wizard/assignments-step.tsx.
- Templates are loaded without type filtering in getChecklistTemplatesForUi.
- Identity uses displayName only and stores no first/last names.

## Gaps (new project only)
1) Department assignment is effectively disabled because the wizard page does not fetch or pass departments.
2) Leave type selection is static and not tied to org-configured leave types.
3) Onboarding checklist selection is not filtered to onboarding templates (offboarding/custom templates can appear).
4) Email existence checks do not surface existing OrgCentral users outside the org (no CTA to invite them).
5) First/last name capture is missing, leaving profile firstName/lastName null.
6) Pay basis/hourly wage support is missing versus the old wizard.

## TODOs
- [ ] Analyze and wire department loading into the onboarding wizard page so departmentId can be set.
- [ ] Analyze and replace static leave types with org-configured leave type options and validation.
- [ ] Analyze and filter onboarding checklist selection to onboarding templates only.
- [ ] Analyze and add existing auth-user detection + invite CTA for cross-org users.
- [ ] Analyze and capture first/last name fields to populate profile data consistently.
- [ ] Analyze and restore pay basis/hourly wage capture and mapping to contract/profile fields.
