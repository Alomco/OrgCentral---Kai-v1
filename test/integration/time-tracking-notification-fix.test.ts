/**
 * Integration test for time tracking notification defensive fix
 *  *
 * This test verifies that time entry creation, update, and approval
 * succeed even when notification emission fails (non-blocking failure pattern).
 *
 * Test Coverage:
 * - Create → Notification Failure → Entry Still Created
 * - Update → Notification Failure → Entry Still Updated
 * - Approve → Notification Failure → Entry Still Approved
 * - Create → Notification Success → No Warning Logged
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/profiles';
import { createTimeEntry } from '@/server/use-cases/hr/time-tracking/create-time-entry';
import { updateTimeEntry } from '@/server/use-cases/hr/time-tracking/update-time-entry';
import { approveTimeEntry } from '@/server/use-cases/hr/time-tracking/approve-time-entry';
import { buildMockTimeEntry, buildMockAuthorization } from '../fixtures/time-entry-fixtures';
import { createMockTimeEntryRepository } from '../mocks/time-entry-repository.mock';
import type {
    CreateTimeEntryPayload,
    UpdateTimeEntryPayload,
    ApproveTimeEntryPayload,
} from '@/server/types/hr-time-tracking-schemas';

// Hoisted mocks for proper vitest module mocking
const mocks = vi.hoisted(() => ({
    emitHrNotificationMock: vi.fn(),
    invalidateTimeEntryCacheMock: vi.fn().mockResolvedValue(undefined),
    appLoggerWarnMock: vi.fn(),
    recordAuditEventMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/server/use-cases/hr/notifications/notification-emitter', () => ({
    emitHrNotification: mocks.emitHrNotificationMock,
}));

vi.mock('@/server/use-cases/hr/time-tracking/cache-helpers', () => ({
    invalidateTimeEntryCache: mocks.invalidateTimeEntryCacheMock,
    registerTimeEntryCache: vi.fn(),
}));

vi.mock('@/server/logging/structured-logger', () => ({
    appLogger: {
        warn: mocks.appLoggerWarnMock,
        info: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/server/logging/audit-logger', () => ({
    recordAuditEvent: mocks.recordAuditEventMock,
}));

describe('Time Entry Notification Defensive Fix', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create time entry successfully even when notification fails', async () => {
        // Arrange
        const authorization = buildMockAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const mockRepo = createMockTimeEntryRepository();
        const createdEntry = buildMockTimeEntry({
            id: 'entry-123',
            userId: authorization.userId,
            orgId: authorization.orgId,
        });

        mockRepo.createTimeEntry.mockResolvedValue(createdEntry);
        mocks.emitHrNotificationMock.mockRejectedValue(new Error('Notification service unavailable'));

        const payload: CreateTimeEntryPayload = {
            userId: authorization.userId,
            clockIn: new Date('2026-02-11T09:00:00Z'),
            clockOut: new Date('2026-02-11T17:00:00Z'),
            breakDuration: 0.5,
            project: 'Test Project',
        };

        // Act
        const result = await createTimeEntry(
            { timeEntryRepository: mockRepo },
            { authorization, payload },
        );

        // Assert
        expect(result.entry).toEqual(createdEntry);
        expect(mockRepo.createTimeEntry).toHaveBeenCalledOnce();
        expect(mocks.emitHrNotificationMock).toHaveBeenCalledOnce();
        expect(mocks.appLoggerWarnMock).toHaveBeenCalledWith(
            'hr.time-tracking.create.notification.failed',
            expect.objectContaining({
                entryId: 'entry-123',
                orgId: authorization.orgId,
                error: 'Notification service unavailable',
            }),
        );
    });

    it('should update time entry successfully even when notification fails', async () => {
        // Arrange
        const authorization = buildMockAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const mockRepo = createMockTimeEntryRepository();
        const existingEntry = buildMockTimeEntry({ id: 'entry-456', status: 'ACTIVE' });
        const updatedEntry = buildMockTimeEntry({
            id: 'entry-456',
            status: 'COMPLETED',
            clockOut: new Date('2026-02-11T17:00:00Z'),
        });

        mockRepo.getTimeEntry.mockResolvedValue(existingEntry);
        mockRepo.updateTimeEntry.mockResolvedValue(updatedEntry);
        mocks.emitHrNotificationMock.mockRejectedValue(new Error('Notification service down'));

        const payload: UpdateTimeEntryPayload = {
            clockOut: new Date('2026-02-11T17:00:00Z'),
        };

        // Act
        const result = await updateTimeEntry(
            { timeEntryRepository: mockRepo },
            { authorization, entryId: 'entry-456', payload },
        );

        // Assert
        expect(result.entry).toEqual(updatedEntry);
        expect(mockRepo.updateTimeEntry).toHaveBeenCalledOnce();
        expect(mocks.appLoggerWarnMock).toHaveBeenCalledWith(
            'hr.time-tracking.update.notification.failed',
            expect.objectContaining({
                entryId: 'entry-456',
                orgId: authorization.orgId,
            }),
        );
    });

    it('should approve time entry successfully even when notification fails', async () => {
        // Arrange
        const authorization = buildMockAuthorization(
            HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE,
            { userId: 'manager-001' },
        );
        const mockRepo = createMockTimeEntryRepository();
        const completedEntry = buildMockTimeEntry({
            id: 'entry-789',
            userId: 'employee-001',
            status: 'COMPLETED',
            clockOut: new Date('2026-02-11T17:00:00Z'),
        });
        const approvedEntry = buildMockTimeEntry({
            ...completedEntry,
            status: 'APPROVED',
            approvedByUserId: 'manager-001',
        });

        mockRepo.getTimeEntry.mockResolvedValue(completedEntry);
        mockRepo.updateTimeEntry.mockResolvedValue(approvedEntry);
        mocks.emitHrNotificationMock.mockRejectedValue(new Error('Notification timeout'));

        const payload: ApproveTimeEntryPayload = {
            status: 'APPROVED',
            comments: 'Approved for payroll',
        };

        // Act
        const result = await approveTimeEntry(
            { timeEntryRepository: mockRepo },
            { authorization, entryId: 'entry-789', payload },
        );

        // Assert
        expect(result.entry.status).toBe('APPROVED');
        expect(mockRepo.updateTimeEntry).toHaveBeenCalledOnce();
        expect(mocks.appLoggerWarnMock).toHaveBeenCalledWith(
            'hr.time-tracking.approve.notification.failed',
            expect.objectContaining({
                entryId: 'entry-789',
                orgId: authorization.orgId,
            }),
        );
    });

    it('should not log warning when notification succeeds', async () => {
        // Arrange
        const authorization = buildMockAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const mockRepo = createMockTimeEntryRepository();
        const createdEntry = buildMockTimeEntry();

        mockRepo.createTimeEntry.mockResolvedValue(createdEntry);
        mocks.emitHrNotificationMock.mockResolvedValue({
            id: 'notification-001',
            /* notification object */
        });

        const payload: CreateTimeEntryPayload = {
            userId: authorization.userId,
            clockIn: new Date('2026-02-11T09:00:00Z'),
            clockOut: new Date('2026-02-11T17:00:00Z'),
        };

        // Act
        await createTimeEntry(
            { timeEntryRepository: mockRepo },
            { authorization, payload },
        );

        // Assert
        expect(mocks.emitHrNotificationMock).toHaveBeenCalledOnce();
        expect(mocks.appLoggerWarnMock).not.toHaveBeenCalled();
    });
});
