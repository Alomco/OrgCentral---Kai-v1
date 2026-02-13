import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { ChecklistInstance, ChecklistInstanceItemsUpdate } from '@/server/types/onboarding-types';
import { parseChecklistInstanceUpdatePayload } from '@/server/validators/hr/onboarding/checklist-instance-validators';
import { ZodError } from 'zod';
import { ValidationError } from '@/server/errors';
import { assertOnboardingChecklistUpdater } from '@/server/security/authorization/hr-guards/onboarding';


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
    await assertOnboardingChecklistUpdater({
        authorization: input.authorization,
        resourceAttributes: { instanceId: input.instanceId },
    });

    let updatePayload: ChecklistInstanceItemsUpdate;
    try {
        updatePayload = parseChecklistInstanceUpdatePayload(input.updates);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError('Invalid checklist instance update payload.', {
                issues: error.issues,
            });
        }
        throw error;
    }

    const instance = await deps.checklistInstanceRepository.updateItems(
        input.authorization.orgId,
        input.instanceId,
        updatePayload,
    );

    // Potentially check for completion here if all items are done?
    // For now, implicit update.

    return { instance };
}
