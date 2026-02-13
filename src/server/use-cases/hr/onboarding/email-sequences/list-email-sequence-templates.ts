import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmailSequenceTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/email-sequence-repository-contract';
import type { EmailSequenceTemplateRecord, EmailSequenceTrigger } from '@/server/types/hr/onboarding-email-sequences';
import { assertOnboardingConfigManager } from '../config/onboarding-config-access';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';

export interface ListEmailSequenceTemplatesInput {
    authorization: RepositoryAuthorizationContext;
    trigger?: EmailSequenceTrigger;
    isActive?: boolean;
}

export interface ListEmailSequenceTemplatesDependencies {
    templateRepository: IEmailSequenceTemplateRepository;
}

export interface ListEmailSequenceTemplatesResult {
    templates: EmailSequenceTemplateRecord[];
}

export async function listEmailSequenceTemplates(
    deps: ListEmailSequenceTemplatesDependencies,
    input: ListEmailSequenceTemplatesInput,
): Promise<ListEmailSequenceTemplatesResult> {
    await assertOnboardingConfigManager({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resourceAttributes: { trigger: input.trigger ?? null, isActive: input.isActive ?? null },
    });
    const templates = await deps.templateRepository.listTemplates(input.authorization.orgId, {
        trigger: input.trigger,
        isActive: input.isActive,
    });
    return { templates };
}
