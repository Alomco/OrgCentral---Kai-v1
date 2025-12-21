import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type {
    IChecklistTemplateRepository,
    ChecklistTemplateCreateInput as ChecklistTemplateRepositoryCreateInput,
} from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import { parseChecklistTemplateCreatePayload } from '@/server/validators/hr/onboarding/checklist-template-validators';
import { assertChecklistTemplateManager } from './template-access';

export interface CreateChecklistTemplateInput {
    authorization: RepositoryAuthorizationContext;
    template: unknown;
}

export interface CreateChecklistTemplateDependencies {
    checklistTemplateRepository: IChecklistTemplateRepository;
}

export interface CreateChecklistTemplateResult {
    template: ChecklistTemplate;
}

export async function createChecklistTemplate(
    deps: CreateChecklistTemplateDependencies,
    input: CreateChecklistTemplateInput,
): Promise<CreateChecklistTemplateResult> {
    assertChecklistTemplateManager(input.authorization);
    const templatePayload = parseChecklistTemplateCreatePayload(input.template);

    const repositoryInput: ChecklistTemplateRepositoryCreateInput = {
        orgId: input.authorization.orgId,
        name: templatePayload.name,
        type: templatePayload.type,
        items: templatePayload.items,
    };

    const template = await deps.checklistTemplateRepository.createTemplate(repositoryInput);

    return { template };
}

