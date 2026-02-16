import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    seedDefaultComplianceTemplates,
    type SeedDefaultComplianceTemplatesDependencies,
} from '@/server/use-cases/hr/compliance/seed-default-templates';
import { seedComplianceTemplatesQuerySchema } from '@/server/types/hr-compliance-schemas';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { resolveComplianceControllerDependencies } from './common';

export interface SeedComplianceTemplatesControllerResult {
    success: true;
    created: boolean;
    templateId: string;
}

export async function seedComplianceTemplatesController(request: Request): Promise<SeedComplianceTemplatesControllerResult> {
    const url = new URL(request.url);
    const query = seedComplianceTemplatesQuerySchema.parse({
        force: url.searchParams.get('force') ?? undefined,
    });

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            requiredPermissions: HR_PERMISSION_PROFILE.COMPLIANCE_TEMPLATE_MANAGE,
            auditSource: 'api:hr:compliance:templates:seed',
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE_TYPE.COMPLIANCE_TEMPLATE,
            resourceAttributes: { seedKey: 'uk-employment', force: query.force ?? false },
        },
    );

    const { complianceTemplateRepository, complianceCategoryRepository } = resolveComplianceControllerDependencies();
    const useCaseDeps: SeedDefaultComplianceTemplatesDependencies = {
        complianceTemplateRepository,
        complianceCategoryRepository,
    };

    const result = await seedDefaultComplianceTemplates(useCaseDeps, {
        authorization,
        force: query.force ?? false,
    });

    return { success: true, created: result.created, templateId: result.template.id };
}
