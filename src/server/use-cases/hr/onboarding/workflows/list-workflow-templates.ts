import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOnboardingWorkflowTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/workflow-template-repository-contract';
import type { OnboardingWorkflowTemplateRecord, WorkflowTemplateType } from '@/server/types/hr/onboarding-workflow-templates';
import { assertOnboardingConfigManager } from '../config/onboarding-config-access';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';

export interface ListWorkflowTemplatesInput {
    authorization: RepositoryAuthorizationContext;
    templateType?: WorkflowTemplateType;
    isActive?: boolean;
}

export interface ListWorkflowTemplatesDependencies {
    workflowTemplateRepository: IOnboardingWorkflowTemplateRepository;
}

export interface ListWorkflowTemplatesResult {
    templates: OnboardingWorkflowTemplateRecord[];
}

export async function listWorkflowTemplates(
    deps: ListWorkflowTemplatesDependencies,
    input: ListWorkflowTemplatesInput,
): Promise<ListWorkflowTemplatesResult> {
    await assertOnboardingConfigManager({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resourceAttributes: { templateType: input.templateType ?? null, isActive: input.isActive ?? null },
    });
    const templates = await deps.workflowTemplateRepository.listTemplates(input.authorization.orgId, {
        templateType: input.templateType,
        isActive: input.isActive,
    });
    return { templates };
}
