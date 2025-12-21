import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { ChecklistTemplate, ChecklistTemplateType } from '@/server/types/onboarding-types';
import { assertChecklistTemplateManager } from './template-access';

export interface ListChecklistTemplatesInput {
    authorization: RepositoryAuthorizationContext;
    type?: ChecklistTemplateType;
}

export interface ListChecklistTemplatesDependencies {
    checklistTemplateRepository: IChecklistTemplateRepository;
}

export interface ListChecklistTemplatesResult {
    templates: ChecklistTemplate[];
}

export async function listChecklistTemplates(
    deps: ListChecklistTemplatesDependencies,
    input: ListChecklistTemplatesInput,
): Promise<ListChecklistTemplatesResult> {
    assertChecklistTemplateManager(input.authorization);

    const templates = await deps.checklistTemplateRepository.listTemplates(input.authorization.orgId);
    if (!input.type) {
        return { templates };
    }

    return {
        templates: templates.filter((template) => template.type === input.type),
    };
}
