import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrchestrationAuthorization } from './people-orchestration.types';
import type { LeaveServiceContract } from '@/server/services/hr/leave/leave-service.provider';
import type { AbsenceServiceContract } from '@/server/services/hr/absences/absence-service.provider';
import type { ComplianceStatusService } from '@/server/services/hr/compliance/compliance-status-service';
import type { MembershipServiceContract } from '@/server/services/org/membership/membership-service.provider';
import type { PeopleService } from './people-service';
import type { IOnboardingInvitationRepository } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';

export type ComplianceStatusServiceContract = Pick<ComplianceStatusService, 'getStatusForUser'>;

export interface ComplianceAssignmentServiceContract {
    assignCompliancePack: (params: {
        authorization: RepositoryAuthorizationContext;
        userIds: string[];
        templateId: string;
        templateItemIds: string[];
    }) => Promise<void>;
}

export interface PeopleOrchestrationDependencies {
    peopleService: PeopleService;
    leaveService: LeaveServiceContract;
    absenceService: AbsenceServiceContract;
    complianceStatusService: ComplianceStatusServiceContract;
    membershipService: MembershipServiceContract;
    complianceAssignmentService?: ComplianceAssignmentServiceContract;
    onboardingInvitationRepository?: IOnboardingInvitationRepository;
    organizationRepository?: IOrganizationRepository;
}

export interface PeopleOrchestrationRuntime {
    deps: PeopleOrchestrationDependencies;
    ensureOrgAccess: (authorization: OrchestrationAuthorization) => Promise<void>;
    execute: <T>(
        authorization: OrchestrationAuthorization,
        operation: string,
        metadata: Record<string, unknown> | undefined,
        handler: () => Promise<T>,
    ) => Promise<T>;
}
