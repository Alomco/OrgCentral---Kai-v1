import type { ComplianceTemplate } from '@/server/types/compliance-types';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listComplianceTemplates, type ListComplianceTemplatesDependencies } from '@/server/use-cases/hr/compliance/list-compliance-templates';
import type { ComplianceControllerDependencies } from './common';
import { resolveComplianceControllerDependencies } from './common';

export interface ListComplianceTemplatesControllerResult {
    success: true;
    templates: ComplianceTemplate[];
}

export async function listComplianceTemplatesController(
    request: Request,
    dependencies?: ComplianceControllerDependencies,
): Promise<ListComplianceTemplatesControllerResult> {
    const { session, complianceTemplateRepository } = resolveComplianceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:compliance:templates:list',
        action: 'list',
        resourceType: 'hr.compliance',
        resourceAttributes: { view: 'templates' },
    });

    const useCaseDeps: ListComplianceTemplatesDependencies = { complianceTemplateRepository };

    const url = new URL(request.url);
    const qRaw = (url.searchParams.get('q') ?? '').trim().toLowerCase();

    const all = await listComplianceTemplates(useCaseDeps, { authorization });
    const templates = qRaw
        ? all.filter((t) => {
            const hay = `${t.name} ${t.categoryKey ?? ''} ${t.version ?? ''}`.toLowerCase();
            return hay.includes(qRaw);
          })
        : all;

    return { success: true, templates };
}