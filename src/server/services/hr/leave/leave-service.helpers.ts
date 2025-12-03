import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import type { LeaveDecisionContext } from '@/server/use-cases/hr/leave/shared/leave-request-helpers';
import type { GetLeaveRequestsInput } from '@/server/use-cases/hr/leave';
import type { LeaveRequest } from '@/server/types/leave-types';
import type { EmployeeProfileDTO } from '@/server/types/hr/people';

const decisionDateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

export interface LeaveNotificationMetadata extends Record<string, unknown> {
    orgId?: string;
    requestId?: string;
}

export interface LeaveNotificationLogger {
    warn: (message: string, metadata?: LeaveNotificationMetadata) => void;
    error: (message: string, metadata?: LeaveNotificationMetadata) => void;
}

export interface CancelNotificationContext {
    userId?: string | null;
    employeeId?: string;
    requestId: string;
    leaveType: string;
    totalDays: number;
    startDate: string;
    endDate: string;
    reason?: string | null;
}

export async function ensureEmployeeByEmployeeNumber(
    profileRepository: IEmployeeProfileRepository,
    orgId: string,
    employeeNumber: string,
): Promise<EmployeeProfileDTO> {
    const normalizedEmployeeNumber = employeeNumber.trim();
    if (typeof profileRepository.findByEmployeeNumber !== 'function') {
        throw new ValidationError('Profile repository is misconfigured.');
    }
    const profile = await profileRepository.findByEmployeeNumber(orgId, normalizedEmployeeNumber);
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { orgId, employeeNumber: normalizedEmployeeNumber });
    }
    return profile;
}

export async function resolveEmployeeFromProfile(
    profileRepository: IEmployeeProfileRepository,
    authorization: RepositoryAuthorizationContext,
    userId: string,
    employeeId?: string,
    fallbackName?: string | null,
): Promise<{ employeeId: string; employeeName: string }> {
    const profile = await profileRepository.getEmployeeProfileByUser(authorization.orgId, userId);
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { orgId: authorization.orgId, userId });
    }
    if (!profile.employeeNumber) {
        throw new ValidationError('Employee profile is missing an employee number.');
    }
    if (employeeId && employeeId !== profile.employeeNumber) {
        throw new ValidationError('Submitted employeeId does not match the employee profile.');
    }

    const displayName = profile.displayName ?? undefined;
    const composedName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = displayName ?? (composedName.length > 0 ? composedName : undefined);
    const employeeName = resolvedName ?? fallbackName ?? 'Employee';

    return { employeeId: profile.employeeNumber, employeeName };
}

export function serializeLeaveFilters(
    filters: GetLeaveRequestsInput['filters'] | undefined,
): Record<string, unknown> | undefined {
    if (!filters) {
        return undefined;
    }

    return {
        status: filters.status,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
    };
}

export async function sendApprovalNotification(
    authorization: RepositoryAuthorizationContext,
    context: LeaveDecisionContext,
    notificationService: HrNotificationServiceContract | undefined,
    logger: LeaveNotificationLogger,
): Promise<void> {
    if (!context.userId) {
        logger.warn('Skipping leave approval notification due to missing userId', {
            orgId: authorization.orgId,
            requestId: context.requestId,
        });
        return;
    }

    await emitHrNotification(
        { service: notificationService },
        {
            authorization,
            notification: {
                userId: context.userId,
                title: 'Leave Request Approved',
                message: buildDecisionMessage(context, 'approved'),
                type: 'leave-approval',
                priority: 'medium',
                actionUrl: '/hr/leave',
                actionLabel: 'View Leave Calendar',
                createdByUserId: authorization.userId,
                correlationId: authorization.correlationId,
                dataClassification: authorization.dataClassification,
                residencyTag: authorization.dataResidency,
                metadata: {
                    requestId: context.requestId,
                    leaveType: context.leaveType,
                    decision: 'approved',
                    totalDays: context.totalDays,
                },
            },
        },
    );
}

export async function sendRejectionNotification(
    authorization: RepositoryAuthorizationContext,
    context: LeaveDecisionContext,
    reason: string,
    notificationService: HrNotificationServiceContract | undefined,
    logger: LeaveNotificationLogger,
): Promise<void> {
    if (!context.userId) {
        logger.warn('Skipping leave rejection notification due to missing userId', {
            orgId: authorization.orgId,
            requestId: context.requestId,
        });
        return;
    }

    await emitHrNotification(
        { service: notificationService },
        {
            authorization,
            notification: {
                userId: context.userId,
                title: 'Leave Request Rejected',
                message: buildDecisionMessage(context, 'rejected', reason),
                type: 'leave-rejection',
                priority: 'high',
                actionUrl: '/hr/leave',
                actionLabel: 'View Details',
                createdByUserId: authorization.userId,
                correlationId: authorization.correlationId,
                dataClassification: authorization.dataClassification,
                residencyTag: authorization.dataResidency,
                metadata: {
                    requestId: context.requestId,
                    leaveType: context.leaveType,
                    decision: 'rejected',
                    totalDays: context.totalDays,
                    reason,
                },
            },
        },
    );
}

export async function sendCancelNotification(
    authorization: RepositoryAuthorizationContext,
    context: CancelNotificationContext,
    notificationService: HrNotificationServiceContract | undefined,
    logger: LeaveNotificationLogger,
): Promise<void> {
    if (!context.userId) {
        logger.warn('Skipping leave cancellation notification due to missing userId', {
            orgId: authorization.orgId,
            requestId: context.requestId,
        });
        return;
    }

    await emitHrNotification(
        { service: notificationService },
        {
            authorization,
            notification: {
                userId: context.userId,
                title: 'Leave Request Cancelled',
                message: buildDecisionMessage(
                    {
                        requestId: context.requestId,
                        leaveType: context.leaveType,
                        totalDays: context.totalDays,
                        startDate: context.startDate,
                        endDate: context.endDate,
                    },
                    'cancelled',
                    context.reason ?? undefined,
                ),
                type: 'other',
                priority: 'medium',
                actionUrl: '/hr/leave',
                actionLabel: 'View Leave Calendar',
                createdByUserId: authorization.userId,
                correlationId: authorization.correlationId,
                dataClassification: authorization.dataClassification,
                residencyTag: authorization.dataResidency,
                metadata: {
                    requestId: context.requestId,
                    leaveType: context.leaveType,
                    decision: 'cancelled',
                    totalDays: context.totalDays,
                    employeeId: context.employeeId,
                    reason: context.reason ?? undefined,
                },
            },
        },
    );
}

export async function safelyDispatchNotification(
    dispatcher: () => Promise<void>,
    failureMessage: string,
    metadata: Record<string, unknown>,
    logger: LeaveNotificationLogger,
): Promise<void> {
    try {
        await dispatcher();
    } catch (error) {
        logger.error(failureMessage, {
            ...metadata,
            error: error instanceof Error ? error.message : error,
        });
    }
}

function buildDecisionMessage(
    context: LeaveDecisionContext,
    decision: 'approved' | 'rejected',
    reason?: string,
): string;
function buildDecisionMessage(
    context: Pick<LeaveRequest, 'totalDays' | 'startDate' | 'endDate'> & { requestId: string; employeeId?: string; leaveType?: string },
    decision: 'cancelled',
    reason?: string,
): string;
function buildDecisionMessage(
    context: LeaveDecisionContext | (Pick<LeaveRequest, 'totalDays' | 'startDate' | 'endDate'> & { requestId: string }),
    decision: 'approved' | 'rejected' | 'cancelled',
    reason?: string,
): string {
    const totalDaysLabel = formatTotalDays(context.totalDays);
    const start = formatDecisionDate(context.startDate);
    const end = formatDecisionDate(context.endDate);
    const base = `Your leave request for ${totalDaysLabel} (${start} - ${end}) has been ${decision}.`;
    if ((decision === 'rejected' || decision === 'cancelled') && reason) {
        return `${base} Reason: ${reason}`;
    }
    return base;
}

function formatDecisionDate(value?: string): string {
    if (!value) {
        return 'Unknown date';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return decisionDateFormatter.format(parsed);
}

function formatTotalDays(totalDays: number): string {
    const normalized = Number.isFinite(totalDays) ? totalDays.toString() : String(totalDays);
    return `${normalized} ${totalDays === 1 ? 'day' : 'days'}`;
}
