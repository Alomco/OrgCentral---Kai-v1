# Leave Policy Use-Cases

This module contains business logic for managing `LeavePolicy` records (the modern replacement for the legacy “Leave Type” map).

## Files

```
leave-policies/
├── README.md
├── create-leave-policy.ts
├── update-leave-policy.ts
├── list-leave-policies.ts
└── delete-leave-policy.ts
```

## Entry Points (API)

Routes are implemented under:
- `GET /api/hr/leave-policies?orgId=<uuid>`
- `POST /api/hr/leave-policies`
- `PATCH /api/hr/leave-policies/:policyId`
- `DELETE /api/hr/leave-policies/:policyId`

See route handlers:
- `src/app/api/hr/leave-policies/route.ts`
- `src/app/api/hr/leave-policies/[policyId]/route.ts`

## Payload Contracts

### Create

`POST /api/hr/leave-policies`

Body:
```json
{
  "policy": {
    "orgId": "<uuid>",
    "name": "Annual Leave",
    "type": "ANNUAL",
    "accrualAmount": 20
  }
}
```

### List

`GET /api/hr/leave-policies?orgId=<uuid>`

### Update

`PATCH /api/hr/leave-policies/:policyId`

Body:
```json
{
  "orgId": "<uuid>",
  "patch": {
    "name": "Annual Leave",
    "type": "ANNUAL",
    "accrualAmount": 25,
    "isDefault": true
  }
}
```

Notes:
- `patch` must contain at least one field.
- If `isDefault` is set to `true`, the repository enforces “single default per org” by unsetting `isDefault` on other policies in the same org inside a transaction.

### Delete

`DELETE /api/hr/leave-policies/:policyId`

Body:
```json
{
  "orgId": "<uuid>"
}
```

## Guards / Tenancy

- Controllers require `requiredPermissions: { organization: ['update'] }`.
- Use-cases also enforce privileged org policy actor checks and reject cross-tenant operations by verifying `payload.orgId === authorization.orgId`.

## Cache Discipline

This module uses the standard leave cache scope registry:
- Scope key: `policies` (maps to the `leave-policies` cache scope)

Behavior:
- Read (`list-leave-policies`) registers the cache tag for the `policies` scope.
- Writes (`create-leave-policy`, `update-leave-policy`, `delete-leave-policy`) invalidate the `policies` scope.

Cache tags are tenant + classification + residency aware via `RepositoryAuthorizationContext`.

## Error Codes

The API layer returns errors through the shared `buildErrorResponse` helper.

Notable codes:
- `VALIDATION_ERROR` (400)
- `AUTHORIZATION_ERROR` (403)
- `ENTITY_NOT_FOUND` (404)
- `LEAVE_POLICY_IN_USE` (409) – thrown when attempting to delete a policy referenced by any `LeaveBalance` or `LeaveRequest`.
