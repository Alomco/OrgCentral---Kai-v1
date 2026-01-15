import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { getComplianceStatusService } from '@/server/services/hr/compliance/compliance-status.service.provider';
import { getMembershipService } from '@/server/services/org/membership/membership-service.provider';
import { getPeopleService } from './people-service.provider';
import { getAbsenceService } from '@/server/services/hr/absences/absence-service.provider';
import { getComplianceAssignmentService } from '@/server/services/hr/compliance/compliance-assignment.service.provider';
import type { AbsenceService } from '@/server/services/hr/absences/absence-service';
import { PeopleOrchestrationService } from './people-orchestration.service';
import type { PeopleOrchestrationDependencies } from './people-orchestration.deps';
import { buildPeopleOrchestrationServiceDependencies, type PeopleOrchestrationServiceDependencyOptions } from '@/server/repositories/providers/hr/people-orchestration-service-dependencies';

export interface PeopleOrchestrationProviderOptions {
    absenceService?: AbsenceService;
    overrides?: Partial<PeopleOrchestrationDependencies>;
    prismaOptions?: PeopleOrchestrationServiceDependencyOptions;
}

export function getPeopleOrchestrationService(options?: PeopleOrchestrationProviderOptions): PeopleOrchestrationService {
    const peopleService = options?.overrides?.peopleService ?? getPeopleService();
    const leaveService = options?.overrides?.leaveService ?? getLeaveService();
    const complianceStatusService =
        options?.overrides?.complianceStatusService ?? getComplianceStatusService();
    const membershipService = options?.overrides?.membershipService ?? getMembershipService();
    const absenceService = options?.overrides?.absenceService ?? options?.absenceService ?? getAbsenceService();
    const complianceAssignmentService =
        options?.overrides?.complianceAssignmentService ?? getComplianceAssignmentService();

    const repositoryDeps = buildPeopleOrchestrationServiceDependencies(options?.prismaOptions);

    const deps: PeopleOrchestrationDependencies = {
        peopleService,
        leaveService,
        absenceService,
        complianceStatusService,
        membershipService,
        complianceAssignmentService,
        onboardingInvitationRepository: repositoryDeps.onboardingInvitationRepository,
        organizationRepository: repositoryDeps.organizationRepository,
    };

    return new PeopleOrchestrationService(deps);
}
