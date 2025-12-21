import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import { assertChecklistTemplateManager } from './template-access';

export interface DeleteChecklistTemplateInput {
    authorization: RepositoryAuthorizationContext;
    templateId: string;
}

export interface DeleteChecklistTemplateDependencies {
    checklistTemplateRepository: IChecklistTemplateRepository;
}

export interface DeleteChecklistTemplateResult {
    success: true;
}

export async function deleteChecklistTemplate(
    deps: DeleteChecklistTemplateDependencies,
    input: DeleteChecklistTemplateInput,
): Promise<DeleteChecklistTemplateResult> {
    assertChecklistTemplateManager(input.authorization);

    await deps.checklistTemplateRepository.deleteTemplate(
        input.authorization.orgId,
        input.templateId,
    );

    return { success: true };
}
