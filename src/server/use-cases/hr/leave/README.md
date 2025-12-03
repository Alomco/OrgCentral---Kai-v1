# Leave Management Use-Cases

This module contains business logic for leave request and balance operations in OrgCentral.

## Architecture

```
leave/
├── index.ts                      # Public API exports
├── shared/                       # Domain-specific utilities
│   ├── cache-helpers.ts          # Cache tagging helpers for leave scopes
│   ├── index.ts
│   └── leave-request-helpers.ts
├── utils/
│   └── resolve-leave-policy.ts   # Ensures policy records exist when creating data
├── approve-leave-request.ts      # Status: submitted → approved
├── reject-leave-request.ts       # Status: submitted → rejected
├── cancel-leave-request.ts       # Status: * → cancelled
├── get-leave-balance.ts          # Query employee balances
├── get-leave-requests.ts         # Query requests with filters
├── submit-leave-request.ts       # Resolve policy + create request payloads
├── create-leave-balance.ts       # Policy-aware balance creation helper
└── ensure-employee-balances.ts   # Admin: create missing balances
```

## Design Principles

### 1. **SOLID Compliance**
- **Single Responsibility**: Each use-case handles one business operation
- **Open/Closed**: Extensible through dependency injection
- **Liskov Substitution**: All use-cases follow consistent interfaces
- **Interface Segregation**: Dependencies only include required repositories
- **Dependency Inversion**: Depends on repository contracts, not implementations

### 2. **Shared Utilities**
Domain-specific helpers are in `./shared/`:
- `fetchLeaveRequest()` - Fetch and validate existence
- `assertLeaveRequestStatus()` - Validate expected status
- `assertLeaveRequestNotInStatus()` - Validate not in forbidden statuses
- `getCurrentTimestamp()` - Generate ISO timestamps
- `registerLeaveCacheScopes()` / `invalidateLeaveCacheScopes()` - Manage tenant-scoped cache tags with residency/classification awareness

### 3. **Consistent Pattern**
Every use-case exports:
```typescript
// 1. Dependencies interface
export interface XyzDependencies {
    repository: IRepository;
}

// 2. Input interface
export interface XyzInput {
    authorization: RepositoryAuthorizationContext;
    // ... operation-specific parameters
}

// 3. Result interface
export interface XyzResult {
    success: true;
    // ... operation-specific data
}

// 4. Async function
export async function xyz(
    deps: XyzDependencies,
    input: XyzInput,
): Promise<XyzResult> {
    // Implementation
}
```

### 4. **File Size Constraint**
All files are kept under 250 LOC to maintain readability and testability.

## Service Layer

- **Entry Point**: `src/server/services/hr/leave/leave-service.ts` extends `AbstractHrService`, injects the leave repositories, and wraps every public method with `executeInServiceContext` for OTEL spans/logging.
- **Operations**: `submitLeaveRequest`, `approveLeaveRequest`, `rejectLeaveRequest`, `cancelLeaveRequest`, `listLeaveRequests`, `getLeaveBalance`, `ensureEmployeeBalances`, and `createLeaveBalance` simply forward to the use-case helpers defined in this folder.
- **Guards**: Each method calls `ensureOrgAccess` so RBAC/ABAC checks run centrally; API adapters only need to resolve a `RepositoryAuthorizationContext` and pass it through.
- **Cache Discipline**: Use-case helpers now call `registerLeaveCacheScopes` / `invalidateLeaveCacheScopes`, so the service can remain orchestration-only. New flows should reuse those helpers rather than touching `next/cache` directly.

## Usage Examples

### Approve Leave Request
```typescript
import { approveLeaveRequest } from '@/server/use-cases/hr/leave';

const result = await approveLeaveRequest(
    {
        leaveRequestRepository,
        leaveBalanceRepository, // optional
    },
    {
        authorization: { orgId, actor },
        requestId: 'req-123',
        approverId: 'user-456',
        comments: 'Approved as requested',
    },
);
// result: { success: true, requestId: 'req-123', approvedAt: '2025-11-23T...' }
```

### Query Leave Balances
```typescript
import { getLeaveBalance } from '@/server/use-cases/hr/leave';

const result = await getLeaveBalance(
    { leaveBalanceRepository },
    {
        authorization: { orgId, actor },
        employeeId: 'emp-789',
        year: 2025, // optional, returns all years if omitted
    },
);
// result: { success: true, balances: [...] }
```

### Ensure Employee Balances
```typescript
import { ensureEmployeeBalances } from '@/server/use-cases/hr/leave';

const result = await ensureEmployeeBalances(
    {
        leaveBalanceRepository,
        leavePolicyRepository,
    },
    {
        authorization: { orgId, actor },
        employeeId: 'emp-789',
        year: 2025,
        leaveTypes: ['ANNUAL', 'SICK', 'SPECIAL'],
    },
);
// result: { success: true, employeeId: 'emp-789', year: 2025, ensuredBalances: 2 }
```

## Error Handling

All use-cases throw typed errors from `@/server/errors`:

- **EntityNotFoundError** - Resource not found (e.g., leave request doesn't exist)
- **ValidationError** - Business rule violation (e.g., invalid status transition)

Example:
```typescript
try {
    await approveLeaveRequest(deps, input);
} catch (error) {
    if (error instanceof EntityNotFoundError) {
        // Handle missing resource
    } else if (error instanceof ValidationError) {
        // Handle validation failure
    }
}
```

## Testing Strategy

1. **Unit Tests**: Mock repository dependencies
2. **Integration Tests**: Use in-memory Prisma or test database
3. **Test Patterns**:
   - Happy path scenarios
   - Error conditions (not found, invalid status)
   - Edge cases (missing optional fields, boundary values)

## Compliance & Security

- **Tenant Isolation**: All operations require `RepositoryAuthorizationContext`
- **Audit Trails**: Authorization context captures `actor` for audit metadata
- **Data Residency**: Enforced at repository layer via `orgId`
- **Classification**: Handled by repository layer based on tenant metadata
- **Zero-Trust Mutations**: `submitLeaveRequestWithPolicy` and `createLeaveBalanceWithPolicy` now accept the full authorization context (no raw `tenantId`), ensuring residency/classification travel with every mutation.

## Dependencies

### Required Repositories
- `ILeaveRequestRepository` - Leave request CRUD operations
- `ILeaveBalanceRepository` - Leave balance CRUD operations
- `ILeavePolicyRepository` - Leave policy queries

### Shared Utilities
- `@/server/use-cases/shared` - Generic validators, normalizers, builders
- `./shared` - Leave-specific helpers (request validators + cache scope helpers)

### Type Definitions
- `@/server/types/leave-types` - Domain models (LeaveRequest, LeaveBalance, LeavePolicy)
- `@/server/repositories/security` - RepositoryAuthorizationContext

## Adding New Use-Cases

1. Create new file: `src/server/use-cases/hr/leave/my-operation.ts`
2. Follow the consistent pattern (Dependencies, Input, Result, function) and always include `authorization: RepositoryAuthorizationContext` in the input contract.
3. Reuse shared helpers from `./shared/` or `@/server/use-cases/shared`
4. Register cache tags on reads via `registerLeaveCacheScopes` and invalidate via `invalidateLeaveCacheScopes` after mutations.
5. Export from `index.ts`
6. Keep file under 250 LOC
7. Add JSDoc comments
8. Update this README with usage example

## Module Metrics

- **Files**: 12 (8 use-cases + cache/policy helpers + index + README)
- **Lines of Code**: ~620 total (avg ~75–85 LOC per use-case)
- **Code Reuse**: Cache helper + request validators are shared across every read/mutation
- **Test Coverage**: TBD (target: 80%+)

## Legacy Parity Gaps

| Gap | Legacy Source | Modern Status / Next Step |
| --- | --- | --- |
| Balance reconciliation when approving/rejecting/cancelling requests | `old/firebase/functions/src/functions/hr-leave.ts` (`approveLeaveRequest`, `rejectLeaveRequest`, `adminCancelLeaveRequest`) | ✅ Implemented in `shared/leave-balance-adjustments.ts` and applied by the approve/reject/cancel use-cases to keep `used/pending/available` in sync with every status change. |
| Decision notifications to employees | `old/firebase/functions/src/functions/hr-leave.ts` (`createLeaveApprovalNotification`, `createLeaveRejectionNotification`) | ✅ `LeaveService` now emits HR notifications via `hrNotificationRepository` after approvals or rejections, mirroring the legacy fan-out (messages match the original copy and failures are logged but non-blocking). |

## Related Documentation

- [Backend Migration Plan](../../../../docs/backend-migration-plan.md)
- [Repository Pattern](../../../repositories/README.md)
- [Structured Logging](../../../../docs/structured-logging-setup.md)
