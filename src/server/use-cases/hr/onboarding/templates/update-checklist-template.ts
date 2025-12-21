import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { ChecklistTemplate, ChecklistTemplateUpdatePayload } from '@/server/types/onboarding-types';
import { assertChecklistTemplateManager } from './template-access';

export interface UpdateChecklistTemplateInput {
    authorization: RepositoryAuthorizationContext;
    templateId: string;
    updates: ChecklistTemplateUpdatePayload;
}

export interface UpdateChecklistTemplateDependencies {
    checklistTemplateRepository: IChecklistTemplateRepository;
}

export interface UpdateChecklistTemplateResult {
    template: ChecklistTemplate;
}

export async function updateChecklistTemplate(
    deps: UpdateChecklistTemplateDependencies,
    input: UpdateChecklistTemplateInput,
): Promise<UpdateChecklistTemplateResult> {
    assertChecklistTemplateManager(input.authorization);

    const template = await deps.checklistTemplateRepository.updateTemplate(
        input.authorization.orgId,
        input.templateId,
        input.updates,
    );

    return { template };
}

