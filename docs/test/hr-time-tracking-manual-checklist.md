# HR Time Tracking - Manual E2E Test Checklist (CYCLE 1 - BLOCKING)

**Test Date**: _______________  
**Tester**: _______________  
**Environment**: http://localhost:3000  
**Duration**: ~35 minutes

---

## Prerequisites

- [ ] Dev server running (`pnpm dev`)
- [ ] Valid user session with HR permissions
- [ ] Browser DevTools Console open
- [ ] Network tab open

---

## TEST 1: Create Valid Completed Entry (3 min)

**Steps**:
1. Navigate to http://localhost:3000/hr/time-tracking
2. Fill form:
   - Clock In: Today, 09:00 AM
   - Clock Out: Today, 05:00 PM
   - Break: 0.5 hours
   - Project: "Manual Test Project"
   - Tasks: "E2E verification"
3. Submit form

**Expected Results**:
- [ ] ✅ Success message: "Time entry created successfully"
- [ ] ✅ Form clears after submission
- [ ] ✅ Entry appears in list below form
- [ ] ✅ Entry shows: Date=today, Hours=7.5, Status=COMPLETED
- [ ] ✅ Browser console: No errors
- [ ] ⚠️ **Server logs**: Check for notification warning (if service unavailable)
- [ ] ✅ Network: POST /api/hr/time-tracking → 201 Created

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## TEST 2: Create Active Entry (No Clock Out) (2 min)

**Steps**:
1. Fill form:
   - Clock In: Current time
   - Clock Out: Leave empty
   - Project: "Active Session Test"
2. Submit

**Expected Results**:
- [ ] ✅ Entry created with Status=ACTIVE
- [ ] ✅ Total Hours: null/undefined
- [ ] ✅ Clock Out: null

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## TEST 3: Validation - Invalid Time Range (2 min)

**Steps**:
1. Fill form:
   - Clock In: 05:00 PM
   - Clock Out: 09:00 AM (earlier than clock-in!)
2. Submit

**Expected Results**:
- [ ] ✅ Error message displayed
- [ ] ✅ Entry **not** created
- [ ] ✅ Form shows validation error

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## TEST 4: Update Existing Entry (3 min)

**Steps**:
1. Locate an ACTIVE entry in list
2. Click "Edit" button
3. Modify:
   - Clock Out: Add current time
   - Notes: Append " - Updated via E2E"
4. Save

**Expected Results**:
- [ ] ✅ Success message: "Time entry updated"
- [ ] ✅ Status: ACTIVE → COMPLETED
- [ ] ✅ Total hours calculated and shown
- [ ] ✅ Updated notes visible

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## TEST 5: IDOR Prevention - Cannot Edit Others' Entries (5 min)

**Steps**:
1. Log in as User A
2. Note an entry ID: `entry-a-123`
3. Log out, log in as User B
4. Try to update `entry-a-123` via API:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/hr/time-tracking/entry-a-123" -Method PATCH -Headers @{"Content-Type"="application/json"} -Body '{"notes":"Unauthorized edit"}'
   ```

**Expected Results**:
- [ ] ✅ API Response: 403 Forbidden or 401 Unauthorized
- [ ] ✅ Error: "Not authorized to modify this time entry"
- [ ] ✅ Entry **not** modified

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## TEST 6: Approve Entry (Manager Only) (3 min)

**Prerequisites**: User must have TIME_ENTRY_APPROVE permission.

**Steps**:
1. Navigate to "Pending Approvals" section
2. Locate a COMPLETED entry
3. Click "Approve"
4. Add comment: "Approved for payroll"
5. Confirm

**Expected Results**:
- [ ] ✅ Success message: "Time entry approved"
- [ ] ✅ Status: COMPLETED → APPROVED
- [ ] ✅ Approved timestamp populated
- [ ] ✅ Entry removed from pending list

**Pass?**: ⬜ YES / ⬜ NO / ⬜ N/A (no permission)  
**Notes**: _______________________________________________________

---

## TEST 7: Self-Approval Prevention (2 min)

**Steps**:
1. Create entry for own user
2. Attempt to approve own entry

**Expected Results**:
- [ ] ✅ Error: "You cannot approve or reject your own time entry"
- [ ] ✅ Approval blocked
- [ ] ✅ Status remains COMPLETED

**Pass?**: ⬜ YES / ⬜ NO / ⬜ N/A  
**Notes**: _______________________________________________________

---

## TEST 8: Database Verification (5 min)

**Steps**:
1. Complete TEST 1
2. Query API:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/hr/time-tracking?userId=<your-user-id>"
   ```
3. Verify data

**Expected Results**:
- [ ] ✅ Entry exists with correct:
  - orgId, userId
  - clockIn, clockOut, totalHours
  - status, project, notes
  - dataClassification, residencyTag
  - metadata (JSON)
  - createdAt, updatedAt

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## TEST 9: Notification Defensive Pattern (10 min)

**Setup**:
1. Temporarily disable notification service OR
2. Edit `src/server/use-cases/hr/notifications/notification-emitter.ts`:
   ```typescript
   export async function emitHrNotification(...) {
     throw new Error('Simulated notification failure');
   }
   ```
3. Restart dev server

**Steps**:
1. Create a time entry (TEST 1)
2. Check server logs

**Expected Results**:
- [ ] ✅ Entry created successfully (not blocked)
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
- [ ] ✅ No exception in server logs
- [ ] ✅ No unhandled rejection

**Cleanup**: Revert notification service changes, restart dev

**Pass?**: ⬜ YES / ⬜ NO  
**Notes**: _______________________________________________________

---

## Summary Results

| Test | Status | Duration |
|------|--------|----------|
| 1. Create Valid Entry | ⬜ PASS / ⬜ FAIL | _____ min |
| 2. Create Active Entry | ⬜ PASS / ⬜ FAIL | _____ min |
| 3. Invalid Time Range | ⬜ PASS / ⬜ FAIL | _____ min |
| 4. Update Entry | ⬜ PASS / ⬜ FAIL | _____ min |
| 5. IDOR Prevention | ⬜ PASS / ⬜ FAIL | _____ min |
| 6. Approve Entry | ⬜ PASS / ⬜ FAIL | _____ min |
| 7. Self-Approval Block | ⬜ PASS / ⬜ FAIL | _____ min |
| 8. Database Verification | ⬜ PASS / ⬜ FAIL | _____ min |
| 9. Notification Defensive | ⬜ PASS / ⬜ FAIL | _____ min |
| **Total** | **___/9 PASSED** | **~35 min** |

---

## Sign-Off

**Cycle 1 Approved?**: ⬜ YES / ⬜ NO  
**Blockers**: _______________________________________________________  
**Signature**: _______________  **Date**: _______________

---

## Issues Found

| Issue # | Test | Severity | Description | Status |
|---------|------|----------|-------------|--------|
| 1 | | P0/P1/P2/P3 | | Open/Fixed |
| 2 | | | | |
| 3 | | | | |

---

## Next Steps

- [ ] Document results in GitHub issue/PR
- [ ] Update test plan status: `docs/test/hr-time-tracking-test-plan.md`
- [ ] Schedule P3 integration tests (16 hours) for Cycle 2+
