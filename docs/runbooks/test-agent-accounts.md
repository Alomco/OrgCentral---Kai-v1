# Test Agent Accounts

This runbook defines how to seed and use behavior-faithful test accounts for agent-driven QA and debugging.

## Goals

- Keep test identities aligned with real auth + membership + org guard behavior.
- Provide a machine-readable and human-readable local catalog for agents.
- Cover common state gates: password setup, profile setup, MFA setup, suspended membership, and no membership.

## Seed Command

```bash
pnpm seed:test-accounts
```

For realistic app testing data (recommended), run:

```bash
pnpm seed:test-accounts:realistic:reset
```

Alternative (without reset):

```bash
pnpm seed:test-accounts:realistic
```

This creates/updates:

- auth identity records (`authUser`, `authAccount`, `authOrgMember`)
- HR identity records (`user`, `membership`, `employeeProfile`)
- org baselines required for realistic behavior (RBAC roles, ABAC policies, permission resources, org security defaults)

## Local Catalog Output

Generated files:

- `.codex/test-accounts/catalog.local.json` (machine-readable)
- `.codex/test-accounts/README.local.md` (agent/operator-friendly)

Both files are local-only and gitignored.

## Persona Set

- `platform_admin_ready`
- `org_beta_admin_mfa_required`
- `org_alpha_admin_ready`
- `org_alpha_hr_manager_ready`
- `org_alpha_member_profile_pending`
- `org_alpha_member_password_pending`
- `org_beta_member_suspended`
- `user_no_membership`

## Validate Seeded State

```bash
pnpm test-accounts:verify
```

Validation checks include:

- auth user/account presence and expected credential state
- membership status, role assignment, and auth-org bridge consistency
- profile completeness state
- RBAC/ABAC foundation records for each seeded org
- org security settings required for MFA gate testing
- realistic org-linked coverage for QA paths (employees, absences, training, notifications, compliance)

## List Accounts

```bash
pnpm test-accounts:list
```

This prints persona key, email, org, role, and state for quick agent selection.

## Environment Variables

- `TEST_ACCOUNTS_PASSWORD`: shared seeded password for personas with credentials
- `TEST_ACCOUNTS_EMAIL_DOMAIN`: email domain suffix
- `TEST_ACCOUNTS_FORCE_PASSWORD_RESET`: force re-hash/update credentials on re-seed
- `TEST_ACCOUNTS_OUTPUT_DIR`: local catalog output path
- `TEST_ACCOUNTS_SEED_SOURCE`: audit source marker written into seed metadata

## Agent Usage Notes

- Use `.codex/test-accounts/catalog.local.json` as the source of truth for credentials and expected behavior.
- For org-scoped tests, select personas with matching `organizationSlug` and `membershipMode`.
- For setup-gate tests, prefer personas with `state` values:
  - `password_setup_required`
  - `profile_setup_required`
  - `mfa_setup_required`
- For authorization guard tests, use:
  - `suspended`
  - `no_membership`
