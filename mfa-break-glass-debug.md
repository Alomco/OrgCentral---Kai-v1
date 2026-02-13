# MFA Break-Glass Verification

## Goal
Fix MFA verification so the break-glass request succeeds and the UI shows the approval state reliably.

## Tasks
- [x] Trace client flow from `TwoFactorForm` to break-glass form resubmission and document state transitions. 
  - Verify: Identify where state can reset or miss MFA verification.
- [x] Trace server-side session/MFA verification handling to ensure MFA status is recognized on subsequent server actions.
  - Verify: Confirm where the MFA state is stored and how it is read by `requestImpersonationBreakGlassAction`.
- [x] Implement the minimal fix to preserve MFA-verified state for the short session window and update UI feedback.
  - Verify: Successful break-glass request returns an approval ID after MFA.
- [x] Add structured logs for MFA-required and MFA-verified paths (no PII).
  - Verify: Logs show expected sequence for a successful flow.
- [ ] Validate with a manual repro (request approval → MFA verify → approval created).
  - Verify: UI shows success message and approval ID, no repeated MFA prompt.

## Done When
- [ ] MFA verification persists for the short session window and break-glass request succeeds after verification.
- [ ] UI consistently shows approval ID after the verified request.
