import { vi } from 'vitest';

import type { LeaveServiceContract } from '@/server/services/hr/leave/leave-service.provider';
import type { AbsenceServiceContract } from '@/server/services/hr/absences/absence-service.provider';
import type { ComplianceStatusService } from '@/server/services/hr/compliance/compliance-status-service';
import type { MembershipServiceContract } from '@/server/services/org/membership/membership-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgAccessInput } from '@/server/security/guards';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import type { LeaveBalance, LeaveRequest } from '@/server/types/leave-types';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import type {
    CancelLeaveRequestResult,
    EnsureEmployeeBalancesResult,
} from '@/server/use-cases/hr/leave';
import type { PeopleService } from '../people-service';
import type { ComplianceAssignmentServiceContract } from '../people-orchestration.deps';
import { PeopleOrchestrationService } from '../people-orchestration.service';

export const ORG_ID = '11111111-1111-4111-8111-111111111111';
export const USER_ID = '22222222-2222-4222-8222-222222222222';
export const TARGET_USER_ID = '33333333-3333-4333-8333-333333333333';
export const PROFILE_ID = '44444444-4444-4444-8444-444444444444';
export const CORRELATION_ID = '55555555-5555-4555-8555-555555555555';

export const authorization: RepositoryAuthorizationContext = {
    orgId: ORG_ID,
    userId: USER_ID,
    roleKey: 'orgAdmin',
    permissions: {},
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    correlationId: CORRELATION_ID,
    auditSource: 'test',
    tenantScope: {
        orgId: ORG_ID,
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        auditBatchId: undefined,
    },
};

export const timestamp = '2025-01-01T00:00:00.000Z';

export const buildLeaveRequest = (overrides: Partial<LeaveRequest> = {}): LeaveRequest => ({
    id: '66666666-6666-4666-8666-666666666666',
    orgId: ORG_ID,
    employeeId: 'EMP-1',
    userId: USER_ID,
    employeeName: 'Test User',
    leaveType: 'annual',
    startDate: '2025-01-10',
    endDate: '2025-01-12',
    totalDays: 3,
    isHalfDay: false,
    status: 'submitted',
    createdAt: timestamp,
    createdBy: USER_ID,
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
    ...overrides,
});

export const buildLeaveBalance = (overrides: Partial<LeaveBalance> = {}): LeaveBalance => ({
    id: '77777777-7777-4777-8777-777777777777',
    orgId: ORG_ID,
    employeeId: 'EMP-1',
    leaveType: 'annual',
    year: 2025,
    totalEntitlement: 20,
    used: 0,
    pending: 0,
    available: 20,
    createdAt: timestamp,
    updatedAt: timestamp,
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
    ...overrides,
});

export const buildAbsence = (overrides: Partial<UnplannedAbsence> = {}): UnplannedAbsence => ({
    id: 'abs-1',
    orgId: 'org-1',
    userId: 'user-1',
    typeId: 'type-1',
    startDate: new Date('2025-01-10T00:00:00.000Z'),
    endDate: new Date('2025-01-11T00:00:00.000Z'),
    hours: 8,
    status: 'APPROVED',
    dataClassification: 'OFFICIAL',
    residencyTag: 'UK_ONLY',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
});

class TestPeopleOrchestrationService extends PeopleOrchestrationService {
    protected override async ensureOrgAccess(
        _authorization: RepositoryAuthorizationContext,
        _guard?: Pick<
            OrgAccessInput,
            | 'requiredPermissions'
            | 'requiredAnyPermissions'
            | 'expectedClassification'
            | 'expectedResidency'
            | 'action'
            | 'resourceType'
            | 'resourceAttributes'
        >,
    ): Promise<void> {
        return;
    }

    protected override async executeInServiceContext<T>(
        _context: ServiceExecutionContext,
        _operationName: string,
        operation: () => Promise<T>,
    ): Promise<T> {
        return operation();
    }
}

export const createService = (overrides?: Partial<{
    peopleService: Partial<PeopleService>;
    leaveService: Partial<LeaveServiceContract>;
    absenceService: Partial<AbsenceServiceContract>;
    complianceStatusService: Partial<ComplianceStatusService>;
    membershipService: Partial<MembershipServiceContract>;
    complianceAssignmentService: Partial<ComplianceAssignmentServiceContract>;
}>) => {
    const leaveRequest = buildLeaveRequest();
    const leaveBalance = buildLeaveBalance();
    const absence = buildAbsence();

    const peopleService = {
        createEmployeeProfile: vi.fn(async () => ({ profileId: PROFILE_ID })),
        createEmploymentContract: vi.fn(async () => ({ contractId: 'contract-1' })),
        updateEmployeeProfile: vi.fn(async () => ({ profileId: PROFILE_ID })),
        updateEmploymentContract: vi.fn(async () => ({ contractId: 'contract-1' })),
        getEmployeeProfile: vi.fn(async () => ({ profile: null })),
        getEmploymentContractByEmployee: vi.fn(async () => ({ contract: null })),
        getEmployeeProfileByUser: vi.fn(async () => ({ profile: null })),
        ...overrides?.peopleService,
    } satisfies Partial<PeopleService>;

    const leaveService = {
        ensureEmployeeBalances: vi.fn(async () => ({
            success: true,
            employeeId: leaveRequest.employeeId,
            year: 2025,
            ensuredBalances: 0,
        } satisfies EnsureEmployeeBalancesResult)),
        getLeaveBalance: vi.fn(async () => ({
            balances: [leaveBalance],
            employeeId: leaveBalance.employeeId,
            year: leaveBalance.year,
        })),
        listLeaveRequests: vi.fn(async () => ({
            requests: [leaveRequest],
            employeeId: leaveRequest.employeeId,
        })),
        cancelLeaveRequest: vi.fn(async () => ({
            success: true,
            requestId: leaveRequest.id,
            cancelledAt: timestamp,
        } satisfies CancelLeaveRequestResult)),
        ...overrides?.leaveService,
    } satisfies Partial<LeaveServiceContract>;

    const absenceService = {
        listAbsences: vi.fn(async () => ({ absences: [absence] })),
        cancelAbsence: vi.fn(async () => ({ absence })),
        ...overrides?.absenceService,
    } satisfies Partial<AbsenceServiceContract>;

    const complianceStatusService = {
        getStatusForUser: vi.fn(async () => null),
        ...overrides?.complianceStatusService,
    } satisfies Partial<ComplianceStatusService>;

    const membershipService = {
        acceptInvitation: vi.fn(async () => ({
            success: true as const,
            organizationId: ORG_ID,
            organizationName: 'OrgCentral',
            roles: ['orgAdmin'],
            alreadyMember: false,
        })),
        ...overrides?.membershipService,
    } satisfies Partial<MembershipServiceContract>;

    const complianceAssignmentService: ComplianceAssignmentServiceContract = {
        assignCompliancePack: vi.fn(async () => undefined),
        ...overrides?.complianceAssignmentService,
    };

    const service = new TestPeopleOrchestrationService({
        peopleService: peopleService as PeopleService,
        leaveService: leaveService as LeaveServiceContract,
        absenceService: absenceService as AbsenceServiceContract,
        complianceStatusService: complianceStatusService as ComplianceStatusService,
        membershipService: membershipService as MembershipServiceContract,
        complianceAssignmentService,
    });

    return {
        service,
        deps: {
            peopleService: peopleService as PeopleService,
            leaveService: leaveService as LeaveServiceContract,
            absenceService: absenceService as AbsenceServiceContract,
            complianceStatusService: complianceStatusService as ComplianceStatusService,
            membershipService: membershipService as MembershipServiceContract,
        },
    };
};
