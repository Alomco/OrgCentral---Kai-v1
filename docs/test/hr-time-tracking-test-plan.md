# HR Time Tracking Module - Comprehensive Testing Plan

**Module**: HR Time Tracking  
**Priority**: P0 (Manual E2E blocking Cycle 1) + P3 (Integration tests)  
**Coverage Target**: 80%+ on use-cases  
**Test Framework**: Vitest (integration), Playwright (E2E)  
**Created**: 2026-02-11

---

## Part 1: Manual E2E Verification (IMMEDIATE - P0)

### Prerequisites

- [ ] Dev server running on `http://localhost:3000` (`pnpm dev`)
- [ ] Valid user session with HR permissions
- [ ] Browser DevTools Console open (for log monitoring)
- [ ] Network tab open (for API monitoring)

### Test Suite 1.1: Create Time Entry Flow

#### Test Case 1.1.1: Create Valid Completed Entry

**Steps:**

1. Navigate to `http://localhost:3000/hr/time-tracking`
2. Verify page loads with "Time Tracking" header and form visible
3. Fill form with valid data:
   - **Clock In**: Today's date, 09:00 AM
   - **Clock Out**: Today's date, 05:00 PM  
   - **Break Duration**: 0.5 (30 minutes)
   - **Project**: "Manual Test Project"
   - **Tasks**: "E2E verification of time tracking"
   - **Notes**: "Testing notification defensive pattern"
4. Click "Submit" button
5. Monitor browser console and server logs

**Expected Results:**

- [ ] ✅ Success toast/message appears: "Time entry created successfully"
- [ ] ✅ Form clears/resets after submission
- [ ] ✅ New entry appears in "Your Time Entries" list below form
- [ ] ✅ Entry shows correct data:
  - Date: today
  - Hours: 7.5 (8 hours - 0.5 break)
  - Project: "Manual Test Project"
  - Status: "COMPLETED"
- [ ] ✅ Browser console: **No unhandled errors**
- [ ] ⚠️ **Server logs**: Check for notification warning (if notification service is unavailable):
  ```json
  {
    "level": "warn",
    "event": "hr.time-tracking.create.notification.failed",
    "entryId": "<uuid>",
    "orgId": "<uuid>",
    "error": "..."
  }
  ```
- [ ] ✅ API Response (Network tab):
  - POST `/api/hr/time-tracking` → 201 Created
  - Response body contains `entry` object with `id`

**Pass Criteria**: Entry created successfully even if notification fails (defensive pattern verified).

---

#### Test Case 1.1.2: Create Active Entry (No Clock Out)

**Steps:**

1. Navigate to `http://localhost:3000/hr/time-tracking`
2. Fill form with partial data:
   - **Clock In**: Current time (e.g., 2:00 PM)
   - **Clock Out**: Leave empty
   - **Project**: "Active Session Test"
3. Submit form

**Expected Results:**

- [ ] ✅ Entry created with status: "ACTIVE"
- [ ] ✅ Total hours: `null` or `undefined` (not calculated yet)
- [ ] ✅ Clock out timestamp: `null`

---

#### Test Case 1.1.3: Validation - Invalid Time Range

**Steps:**

1. Fill form with invalid data:
   - **Clock In**: 05:00 PM
   - **Clock Out**: 09:00 AM (earlier than clock-in)
2. Submit form

**Expected Results:**

- [ ] ✅ Error message displayed: "Clock out must be after clock in" (or similar)
- [ ] ✅ Entry **not** created
- [ ] ✅ Form shows validation error state

---

### Test Suite 1.2: Update Time Entry Flow

#### Test Case 1.2.1: Update Existing Entry

**Steps:**

1. Locate an existing "ACTIVE" entry in the list
2. Click "Edit" button / navigate to edit view
3. Modify fields:
   - **Clock Out**: Add current time
   - **Notes**: Append " - Updated via E2E test"
4. Save changes

**Expected Results:**

- [ ] ✅ Success message: "Time entry updated successfully"
- [ ] ✅ Entry status changes from "ACTIVE" → "COMPLETED"
- [ ] ✅ Total hours calculated and displayed
- [ ] ✅ Updated notes visible in list
- [ ] ⚠️ **Server logs**: Check for notification warning (optional)

---

#### Test Case 1.2.2: IDOR Prevention - User A Cannot Edit User B's Entry

**Steps:**

1. Log in as **User A** (HR staff user)
2. Note an entry ID belonging to **User A**: `entry-a-123`
3. Log out, log in as **User B** (different HR staff user)
4. Attempt to update `entry-a-123` via direct API call:
   ```bash
   curl -X PATCH http://localhost:3000/api/hr/time-tracking/entry-a-123 \
     -H "Content-Type: application/json" \
     -d '{"notes": "Unauthorized edit attempt"}'
   ```

**Expected Results:**

- [ ] ✅ API Response: `403 Forbidden` or `401 Unauthorized`
- [ ] ✅ Error message: "Not authorized to modify this time entry"
- [ ] ✅ Entry **not** modified in database
- [ ] ✅ Audit log records unauthorized access attempt

**Note**: If UI doesn't expose edit controls for other users' entries, test via API only.

---

### Test Suite 1.3: Approve Time Entry Flow

#### Test Case 1.3.1: Approve Completed Entry (Manager)

**Prerequisites**: User must have `TIME_ENTRY_APPROVE` permission (manager role).

**Steps:**

1. Navigate to `http://localhost:3000/hr/time-tracking`
2. Scroll to "Pending Approvals" section (if authorized)
3. Locate a "COMPLETED" entry awaiting approval
4. Click "Approve" button
5. Optionally add comments: "Approved for payroll"
6. Confirm approval

**Expected Results:**

- [ ] ✅ Success message: "Time entry approved"
- [ ] ✅ Entry status: "COMPLETED" → "APPROVED"
- [ ] ✅ Approved timestamp populated
- [ ] ✅ Approved by user ID matches current manager
- [ ] ✅ Entry removed from "Pending Approvals" list
- [ ] ⚠️ **Server logs**: Check for notification warning (sent to employee)

---

#### Test Case 1.3.2: Self-Approval Prevention

**Steps:**

1. Log in as **User A**
2. Create a time entry for **User A**
3. Attempt to approve own entry (if approve controls visible)

**Expected Results:**

- [ ] ✅ Error message: "You cannot approve or reject your own time entry"
- [ ] ✅ Approval **blocked** (server-side validation)
- [ ] ✅ Status remains "COMPLETED"

---

### Test Suite 1.4: Database State Verification

**Steps:**

1. Complete Test Case 1.1.1 (create entry)
2. Query database directly or via API:
   ```bash
   curl http://localhost:3000/api/hr/time-tracking?userId=<user-id>
   ```
3. Verify returned data

**Expected Results:**

- [ ] ✅ Entry exists in database with correct:
  - `orgId`, `userId`
  - `clockIn`, `clockOut`, `totalHours`
  - `status`, `project`, `notes`
  - `dataClassification`, `residencyTag`
  - `metadata` field (JSON)
  - `createdAt`, `updatedAt` timestamps
- [ ] ✅ Audit log entry created for `CREATE` action:
  - `eventType: DATA_CHANGE`
  - `action: CREATE`
  - `resource: TIME_ENTRY`
  - `resourceId: <entry-id>`

---

### Test Suite 1.5: Notification Defensive Pattern Verification

**Objective**: Confirm time entry operations succeed even when notification service fails.

**Setup**: Temporarily disable notification service or inject failure.

**Steps**:

1. **Simulate notification failure**:
   - Edit `src/server/use-cases/hr/notifications/notification-emitter.ts`
   - Add early `throw new Error('Simulated notification failure')`
   - OR disable notification service endpoint
2. Perform Test Case 1.1.1 (create entry)
3. Check server logs

**Expected Results:**

- [ ] ✅ Entry created successfully (operation not blocked)
- [ ] ✅ Success message shown in UI
- [ ] ✅ Server logs **warning** (not error):
  ```json
  {
    "level": "warn",
    "event": "hr.time-tracking.create.notification.failed",
    "entryId": "<uuid>",
    "orgId": "<uuid>",
    "error": "Simulated notification failure"
  }
  ```
- [ ] ✅ No exception propagated to client
- [ ] ✅ No unhandled rejection in server logs

**Cleanup**: Revert notification service changes.

---

### Manual Test Summary

| Test Case | Priority | Est. Time | Status |
|-----------|----------|-----------|--------|
| 1.1.1 Create Valid Entry | P0 | 3 min | ⬜ |
| 1.1.2 Create Active Entry | P1 | 2 min | ⬜ |
| 1.1.3 Invalid Time Range | P1 | 2 min | ⬜ |
| 1.2.1 Update Entry | P0 | 3 min | ⬜ |
| 1.2.2 IDOR Prevention | P0 | 5 min | ⬜ |
| 1.3.1 Approve Entry | P0 | 3 min | ⬜ |
| 1.3.2 Self-Approval Block | P1 | 2 min | ⬜ |
| 1.4 Database Verification | P0 | 5 min | ⬜ |
| 1.5 Notification Defensive | P0 | 10 min | ⬜ |
| **Total** | | **35 min** | |

---

## Part 2: Integration Test Coverage (DEFERRED - P3)

### Test File Structure

```
test/integration/
├── time-tracking-notification-fix.test.ts   ✅ Scaffold exists
└── time-tracking-authorization.test.ts      🆕 New file
└── time-tracking-database-state.test.ts     🆕 New file
└── time-tracking-structured-logging.test.ts 🆕 New file
```

---

### Test Suite 2.1: Notification Defensive Pattern

**File**: `test/integration/time-tracking-notification-fix.test.ts`

**Test Cases**:

1. ✅ **Create entry succeeds when notification fails**
   - Mock `emitHrNotification` to throw error
   - Call `createTimeEntry` use-case
   - Assert entry created (`timeEntryRepository.createTimeEntry` called)
   - Assert no exception thrown from use-case
   - Assert `appLogger.warn` called with correct event

2. ✅ **Update entry succeeds when notification fails**
   - Mock `emitHrNotification` to throw error  
   - Call `updateTimeEntry` use-case
   - Assert entry updated
   - Assert warning logged

3. ✅ **Approve entry succeeds when notification fails**
   - Mock `emitHrNotification` to throw error
   - Call `approveTimeEntry` use-case
   - Assert entry approved
   - Assert warning logged

4. ✅ **Notification success does not affect entry creation**
   - Mock `emitHrNotification` to resolve successfully
   - Call `createTimeEntry` use-case
   - Assert entry created
   - Assert no warning logged

**Mock Setup**:

```typescript
const mocks = vi.hoisted(() => ({
  emitHrNotificationMock: vi.fn(),
  invalidateTimeEntryCacheMock: vi.fn().mockResolvedValue(undefined),
  appLoggerWarnMock: vi.fn(),
}));

vi.mock('@/server/use-cases/hr/notifications/notification-emitter', () => ({
  emitHrNotification: mocks.emitHrNotificationMock,
}));

vi.mock('@/server/logging/structured-logger', () => ({
  appLogger: {
    warn: mocks.appLoggerWarnMock,
    info: vi.fn(),
    error: vi.fn(),
  },
}));
```

**Effort**: 4 hours (includes mock setup, 4 test cases, documentation)

---

### Test Suite 2.2: Authorization & IDOR Prevention

**File**: `test/integration/time-tracking-authorization.test.ts`

**Test Cases**:

1. ✅ **User A cannot update User B's time entry**
   - Create entry for User B
   - Attempt update with User A authorization
   - Assert `AuthorizationError` thrown

2. ✅ **User A cannot approve own entry**
   - Create entry for User A
   - Attempt approval with User A authorization
   - Assert `AuthorizationError` thrown with message: "You cannot approve or reject your own time entry"

3. ✅ **Manager can approve subordinate's entry**
   - Create entry for User B
   - Approve with Manager A authorization (different user)
   - Assert approval succeeds

4. ✅ **Non-privileged user cannot approve any entry**
   - Create entry for User B
   - Attempt approval with User C authorization (no `TIME_ENTRY_APPROVE` permission)
   - Assert `AuthorizationError` thrown

5. ✅ **User can only list own entries (tenant scoping)**
   - Create entries for User A and User B in same org
   - Call `listTimeEntries` with User A authorization
   - Assert only User A entries returned

**Mock Repository**:

```typescript
const buildMockRepository = (): ITimeEntryRepository => ({
  createTimeEntry: vi.fn().mockResolvedValue(buildTimeEntry()),
  updateTimeEntry: vi.fn().mockResolvedValue(buildTimeEntry()),
  getTimeEntry: vi.fn().mockResolvedValue(buildTimeEntry()),
  listTimeEntries: vi.fn().mockResolvedValue([]),
});
```

**Effort**: 5 hours (5 authorization scenarios, permission matrix testing)

---

### Test Suite 2.3: Database State Verification

**File**: `test/integration/time-tracking-database-state.test.ts`

**Test Cases**:

1. ✅ **Created entry has correct tenant scoping**
   - Create entry with authorization context
   - Assert entry has correct `orgId`, `dataClassification`, `residencyTag`

2. ✅ **Metadata field preserves JSON structure**
   - Create entry with complex metadata: `{ tags: ['urgent'], payrollCode: 'P123' }`
   - Retrieve entry
   - Assert metadata matches original

3. ✅ **Timestamps auto-populate**
   - Create entry
   - Assert `createdAt` and `updatedAt` are Date objects and approximately now

4. ✅ **Update changes updatedAt timestamp**
   - Create entry at T0
   - Wait 100ms
   - Update entry at T1
   - Assert `updatedAt > createdAt`

5. ✅ **Approval populates decision fields**
   - Create completed entry
   - Approve entry
   - Assert `approvedByOrgId`, `approvedByUserId`, `approvedAt` populated
   - Assert `status === 'APPROVED'`

**Effort**: 4 hours (5 database state assertions, timestamp handling)

---

### Test Suite 2.4: Structured Logging Output

**File**: `test/integration/time-tracking-structured-logging.test.ts`

**Test Cases**:

1. ✅ **Create logs notification failure with correct event**
   - Mock `emitHrNotification` to throw
   - Create entry
   - Assert `appLogger.warn` called with:
     - Event: `'hr.time-tracking.create.notification.failed'`
     - Context: `{ entryId, orgId, error }`

2. ✅ **Update logs notification failure**
   - Mock notification failure
   - Update entry
   - Assert warning logged with `'hr.time-tracking.update.notification.failed'`

3. ✅ **Approve logs notification failure**
   - Mock notification failure
   - Approve entry
   - Assert warning logged with `'hr.time-tracking.approve.notification.failed'`

4. ✅ **Audit logger called for create**
   - Mock `recordAuditEvent`
   - Create entry
   - Assert audit event recorded with:
     - `eventType: 'DATA_CHANGE'`
     - `action: 'CREATE'`
     - `resource: 'TIME_ENTRY'`

5. ✅ **Audit logger called for update**
   - Mock `recordAuditEvent`
   - Update entry
   - Assert audit event with `action: 'UPDATE'` and `updateKeys` array

**Mock Setup**:

```typescript
vi.mock('@/server/logging/audit-logger', () => ({
  recordAuditEvent: vi.fn().mockResolvedValue(undefined),
}));
```

**Effort**: 3 hours (5 logging assertions, audit event verification)

---

### Integration Test Summary

| Test Suite | File | Test Cases | Effort | Coverage Impact |
|------------|------|------------|--------|-----------------|
| 2.1 Notification Defensive | `time-tracking-notification-fix.test.ts` | 4 | 4h | +15% |
| 2.2 Authorization/IDOR | `time-tracking-authorization.test.ts` | 5 | 5h | +20% |
| 2.3 Database State | `time-tracking-database-state.test.ts` | 5 | 4h | +15% |
| 2.4 Structured Logging | `time-tracking-structured-logging.test.ts` | 5 | 3h | +10% |
| **Total** | 4 files | **19 cases** | **16h** | **~60%** |

**Note**: Combined with existing `time-entry-use-cases.test.ts` (~30% coverage), total coverage reaches **~90%** for use-cases.

---

## Success Criteria

### Manual E2E (Blocking Cycle 1)

- [ ] ✅ All 9 manual test cases pass
- [ ] ✅ Notification defensive pattern verified (no blocking failures)
- [ ] ✅ IDOR prevention confirmed via API testing
- [ ] ✅ Database state matches expected schema
- [ ] ✅ Structured logging outputs correct events
- [ ] ✅ No unhandled errors in browser/server logs
- [ ] ✅ Test results documented in GitHub issue/PR

### Integration Tests (P3 - Deferred)

- [ ] ⬜ 80%+ line coverage on use-cases:
  - `create-time-entry.ts`
  - `update-time-entry.ts`
  - `approve-time-entry.ts`
- [ ] ⬜ All 19 integration test cases pass
- [ ] ⬜ Mocks properly isolated (no DB/network calls)
- [ ] ⬜ Tests execute in < 5 seconds total
- [ ] ⬜ CI/CD pipeline passes (`pnpm test`)

---

## Test Execution Commands

```bash
# Manual E2E preparation
pnpm dev                              # Start dev server on :3000
# Then follow manual test script in browser

# Integration tests
pnpm test test/integration/time-tracking-notification-fix.test.ts
pnpm test test/integration/time-tracking-authorization.test.ts
pnpm test test/integration/time-tracking-database-state.test.ts
pnpm test test/integration/time-tracking-structured-logging.test.ts

# All integration tests
pnpm test test/integration/

# Coverage report
pnpm test --coverage
```

---

## Fixture/Mock Requirements

### Mock Factories

```typescript
// test/fixtures/time-entry-fixtures.ts
export function buildMockTimeEntry(overrides?: Partial<TimeEntry>): TimeEntry {
  return {
    id: 'entry-test-001',
    orgId: 'org-test-001',
    userId: 'user-test-001',
    date: new Date('2026-02-11T00:00:00Z'),
    clockIn: new Date('2026-02-11T09:00:00Z'),
    clockOut: new Date('2026-02-11T17:00:00Z'),
    totalHours: 8,
    breakDuration: 0,
    project: null,
    tasks: null,
    notes: null,
    status: 'COMPLETED',
    approvedByOrgId: null,
    approvedByUserId: null,
    approvedAt: null,
    dataClassification: 'OFFICIAL',
    residencyTag: 'UK_ONLY',
    metadata: {},
    createdAt: new Date('2026-02-11T10:00:00Z'),
    updatedAt: new Date('2026-02-11T10:00:00Z'),
    ...overrides,
  };
}

export function buildMockAuthorization(
  permissions: OrgPermissionMap,
  overrides?: Partial<RepositoryAuthorizationContext>
): RepositoryAuthorizationContext {
  return {
    orgId: 'org-test-001',
    userId: 'user-test-001',
    dataClassification: 'OFFICIAL' as const,
    dataResidency: 'UK_ONLY' as const,
    auditSource: 'test',
    tenantScope: {
      orgId: 'org-test-001',
      dataClassification: 'OFFICIAL' as const,
      dataResidency: 'UK_ONLY' as const,
      auditSource: 'test',
    },
    roleKey: 'custom',
    permissions,
    ...overrides,
  };
}
```

### Mock Repository

```typescript
// test/mocks/time-entry-repository.mock.ts
export const createMockTimeEntryRepository = (): ITimeEntryRepository => ({
  createTimeEntry: vi.fn(),
  updateTimeEntry: vi.fn(),
  getTimeEntry: vi.fn(),
  listTimeEntries: vi.fn(),
});
```

---

## Appendix: Known Limitations

1. **E2E Tests**: No automated Playwright E2E tests yet - manual only for Cycle 1
2. **Notification Service**: Integration tests mock notification service (no real SMTP/push)
3. **Database Isolation**: Integration tests use mocked repositories, not real DB transactions
4. **Multi-tenancy**: Limited testing of cross-org isolation (requires dedicated test org setup)
5. **Performance**: No load testing for bulk time entry operations

---

## Next Steps After Cycle 1

1. ✅ Complete manual E2E testing (35 min)
2. ✅ Document results in PR/GitHub issue
3. ⬜ Implement integration tests (16 hours over 2-3 sprints)
4. ⬜ Add Playwright E2E suite for critical flows (8 hours)
5. ⬜ Set up CI/CD coverage reporting (2 hours)
6. ⬜ Add performance benchmarks for bulk operations (4 hours)

---

**Total Effort Estimate**:
- **Immediate (P0)**: 35 minutes manual testing
- **Deferred (P3)**: 16 hours integration tests + 14 hours automation/CI = **30 hours**

**Blocking Cycle 1**: ✅ Manual E2E only (35 min)  
**Cycle 2+**: Integration tests and automation
