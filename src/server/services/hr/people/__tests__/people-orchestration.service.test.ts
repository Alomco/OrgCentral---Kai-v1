import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { LeaveServiceContract } from '@/server/services/hr/leave/leave-service.provider';
import type { AbsenceServiceContract } from '@/server/services/hr/absences/absence-service.provider';
import type { ComplianceStatusService } from '@/server/services/hr/compliance/compliance-status-service';
import type { MembershipServiceContract } from '@/server/services/org/membership/membership-service.provider';
import type { PeopleService } from '../people-service';
import { PeopleOrchestrationService } from '../people-orchestration.service';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

vi.mock('../helpers/people-orchestration.helpers', () => ({
    registerSummaryCaches: vi.fn(),
    invalidateOnboardCaches: vi.fn(async () => undefined),
    invalidateEligibilityCaches: vi.fn(async () => undefined),
    invalidateTerminationCaches: vi.fn(async () => undefined),
    invalidateComplianceAssignmentCaches: vi.fn(async () => undefined),
    buildTelemetryMetadata: vi.fn((operation: string, _auth: RepositoryAuthorizationContext, metadata?: Record<string, unknown>) => ({
        auditSource: `service:hr:people.${operation}`,
        ...metadata,
    })),
}));

const authorization: RepositoryAuthorizationContext = {
    orgId: 'org-1',
    userId: 'user-1',
    roleKey: 'orgAdmin',
    permissions: {},
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    correlationId: 'corr-1',
    auditSource: 'test',
    tenantScope: {
        orgId: 'org-1',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        auditBatchId: undefined,
    },
};

const createService = (overrides?: Partial<{
    peopleService: Partial<PeopleService>;
    leaveService: Partial<LeaveServiceContract>;
    absenceService: Partial<AbsenceServiceContract>;
    complianceStatusService: Partial<ComplianceStatusService>;
    membershipService: Partial<MembershipServiceContract>;
    complianceAssignmentService: Partial<{ assignCompliancePack: (args: any) => Promise<void> }>;
}>) => {
    const peopleService = {
        createEmployeeProfile: vi.fn(async () => ({ profileId: 'profile-1' })),
        createEmploymentContract: vi.fn(async () => ({ contractId: 'contract-1' })),
        updateEmployeeProfile: vi.fn(async () => ({})),
        updateEmploymentContract: vi.fn(async () => ({})),
        getEmployeeProfile: vi.fn(async () => ({ profile: { id: 'profile-1', userId: 'user-1', employeeNumber: 'EMP-1' } })),
        getEmploymentContractByEmployee: vi.fn(async () => ({ contract: { id: 'contract-1' } })),
        getEmployeeProfileByUser: vi.fn(async () => ({ profile: { id: 'profile-1', userId: 'user-1', employeeNumber: 'EMP-1' } })),
        ...overrides?.peopleService,
    } as unknown as PeopleService;

    const leaveService = {
        ensureEmployeeBalances: vi.fn(async () => ({})),
        getLeaveBalance: vi.fn(async () => ({ balances: [] })),
        listLeaveRequests: vi.fn(async () => ({ requests: [] })),
        cancelLeaveRequest: vi.fn(async () => ({})),
        ...overrides?.leaveService,
    } as LeaveServiceContract;

    const absenceService = {
        listAbsences: vi.fn(async () => ({ absences: [] })),
        cancelAbsence: vi.fn(async () => ({})),
        ...overrides?.absenceService,
    } as unknown as AbsenceServiceContract;

    const complianceStatusService = {
        getStatusForUser: vi.fn(async () => null),
        ...overrides?.complianceStatusService,
    } as unknown as ComplianceStatusService;

    const membershipService = {
        acceptInvitation: vi.fn(async () => ({ status: 'ok' })),
        ...overrides?.membershipService,
    } as unknown as MembershipServiceContract;

    const complianceAssignmentService = {
        assignCompliancePack: vi.fn(async () => undefined),
        ...overrides?.complianceAssignmentService,
    };

    const service = new PeopleOrchestrationService({
        peopleService,
        leaveService,
        absenceService,
        complianceStatusService,
        membershipService,
        complianceAssignmentService,
    });

    // Bypass guard and logger wrappers for unit-level tests.
    (service as any).ensureOrgAccess = async () => undefined;
    (service as any).executeInServiceContext = async (_ctx: unknown, _op: string, handler: () => Promise<unknown>) => handler();

    return { service, deps: { peopleService, leaveService, absenceService, complianceStatusService, membershipService } };
};

describe('PeopleOrchestrationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('onboardEmployee creates profile, optional contract, ensures balances', async () => {
        const { service, deps } = createService();

        const result = await service.onboardEmployee({
            authorization,
            profileDraft: {
                userId: 'user-2',
                employeeNumber: 'EMP-2',
                employmentType: 'FULL_TIME',
            },
            eligibleLeaveTypes: ['annual'],
        });

        expect(result.profileId).toBe('profile-1');
        expect(deps.peopleService.createEmployeeProfile).toHaveBeenCalled();
        expect(deps.leaveService.ensureEmployeeBalances).toHaveBeenCalledWith({
            authorization,
            employeeId: 'EMP-2',
            year: expect.any(Number),
            leaveTypes: ['annual'],
        });
    });

    it('updateEligibility updates profile and ensures balances with employee number', async () => {
        const { service, deps } = createService();

        await service.updateEligibility({
            authorization,
            profileId: 'profile-1',
            eligibleLeaveTypes: ['annual', 'sick'],
            year: 2025,
        });

        expect(deps.peopleService.updateEmployeeProfile).toHaveBeenCalledWith({
            authorization,
            payload: { profileId: 'profile-1', profileUpdates: { eligibleLeaveTypes: ['annual', 'sick'] } },
        });
        expect(deps.leaveService.ensureEmployeeBalances).toHaveBeenCalledWith({
            authorization,
            employeeId: 'EMP-1',
            year: 2025,
            leaveTypes: ['annual', 'sick'],
        });
    });

    it('terminateEmployee cancels pending leave and updates records', async () => {
        const { service, deps } = createService({
            leaveService: {
                listLeaveRequests: vi.fn(async () => ({ requests: [{ id: 'req-1' }] })),
                cancelLeaveRequest: vi.fn(async () => ({})),
                ensureEmployeeBalances: vi.fn(async () => ({})),
                getLeaveBalance: vi.fn(async () => ({ balances: [] })),
            } as any,
            absenceService: {
                listAbsences: vi.fn(async () => ({ absences: [{ id: 'abs-1', status: 'APPROVED' }] })),
                cancelAbsence: vi.fn(async () => ({})),
            } as any,
        });

        await service.terminateEmployee({
            authorization,
            profileId: 'profile-1',
            termination: { reason: 'Reduction', date: new Date('2025-01-01') },
            cancelPendingLeave: true,
        });

        expect(deps.peopleService.updateEmployeeProfile).toHaveBeenCalled();
        expect(deps.leaveService.listLeaveRequests).toHaveBeenCalledWith({
            authorization,
            employeeId: 'EMP-1',
            filters: { status: 'submitted' },
        });
        expect(deps.leaveService.cancelLeaveRequest).toHaveBeenCalledWith({
            authorization,
            requestId: 'req-1',
            cancelledBy: authorization.userId,
            reason: 'Reduction',
        });
        expect(deps.absenceService.cancelAbsence).toHaveBeenCalledWith({
            authorization,
            absenceId: 'abs-1',
            payload: { reason: 'Reduction' },
        });
    });
});
