import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { ChecklistInstance, ChecklistInstanceItemsUpdate } from '@/server/types/onboarding-types';
import { parseChecklistInstanceUpdatePayload } from '@/server/validators/hr/onboarding/checklist-instance-validators';


export interface UpdateChecklistInstanceInput {
    authorization: RepositoryAuthorizationContext;
    instanceId: string;
    updates: unknown;
}

export interface UpdateChecklistInstanceDependencies {
    checklistInstanceRepository: IChecklistInstanceRepository;
}

export interface UpdateChecklistInstanceResult {
    instance: ChecklistInstance;
}

export async function updateChecklistInstance(
    deps: UpdateChecklistInstanceDependencies,
    input: UpdateChecklistInstanceInput,
): Promise<UpdateChecklistInstanceResult> {

    // Authorization: Ideally, the user updating must be the employee OR an HR admin.
    // For now we will rely on repository-level checks or simple check here.
    // assertChecklistTemplateManager(input.authorization); 

    const updatePayload: ChecklistInstanceItemsUpdate = parseChecklistInstanceUpdatePayload(input.updates);

    const instance = await deps.checklistInstanceRepository.updateItems(
        input.authorization.orgId,
        input.instanceId,
        updatePayload,
    );

    // Potentially check for completion here if all items are done?
    // For now, implicit update.

    return { instance };
}
