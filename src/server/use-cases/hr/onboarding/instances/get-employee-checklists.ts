import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { assertOnboardingChecklistLister } from '@/server/security/authorization/hr-guards/onboarding';


export interface GetEmployeeChecklistsInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface GetEmployeeChecklistsDependencies {
    checklistInstanceRepository: IChecklistInstanceRepository;
}

export interface GetEmployeeChecklistsResult {
    instances: ChecklistInstance[];
}

export async function getEmployeeChecklists(
    deps: GetEmployeeChecklistsDependencies,
    input: GetEmployeeChecklistsInput,
): Promise<GetEmployeeChecklistsResult> {
    const { orgId, userId } = input.authorization;

    await assertOnboardingChecklistLister({
        authorization: input.authorization,
        resourceAttributes: { employeeId: input.employeeId },
    });

    // Authorization: Users can see their own checklists, or managers/admins can see others (handled by repo/service usually, but basic check here)
    // For now, assuming basic "can read profile" permission handled by caller/session, but stricter check:
    if (input.employeeId !== userId) {
        // In a real app, check if userId has 'read' permission on 'employee-profile' resource of input.employeeId
        // For this task, we'll delegate to the repository permissions or assume the controller checked "read:onboarding"
    }

    const instances = await deps.checklistInstanceRepository.listInstancesForEmployee(orgId, input.employeeId);

    return { instances };
}
