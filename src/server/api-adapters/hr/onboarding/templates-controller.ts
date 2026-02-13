import { ZodError, type ZodType } from 'zod';
import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_CHECKLIST_TEMPLATES } from '@/server/constants/cache-scopes';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createChecklistTemplate } from '@/server/use-cases/hr/onboarding/templates/create-checklist-template';
import { deleteChecklistTemplate } from '@/server/use-cases/hr/onboarding/templates/delete-checklist-template';
import { listChecklistTemplates } from '@/server/use-cases/hr/onboarding/templates/list-checklist-templates';
import { updateChecklistTemplate } from '@/server/use-cases/hr/onboarding/templates/update-checklist-template';
import { ValidationError } from '@/server/errors';
import { getChecklistTemplateRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';
import type {
    ChecklistTemplate,
    ChecklistTemplateCreatePayload,
    ChecklistTemplateListFilters,
    ChecklistTemplateUpdatePayload,
} from '@/server/types/onboarding-types';
import {
    checklistTemplateCreateSchema,
    checklistTemplateIdSchema,
    checklistTemplateListFilterSchema,
    checklistTemplateUpdateSchema,
} from '@/server/validators/hr/onboarding/checklist-template-validators';

interface ChecklistTemplateListResult {
    success: true;
    data: { templates: ChecklistTemplate[] };
}

interface ChecklistTemplateMutationResult {
    success: true;
    data: { template: ChecklistTemplate };
}

interface ChecklistTemplateDeleteResult {
    success: true;
}

const checklistTemplateRepository = getChecklistTemplateRepository();

async function authorizeTemplateRequest(
    request: Request,
    auditSource: string,
    action: 'create' | 'list' | 'update' | 'delete',
    resourceAttributes?: Record<string, unknown>,
) {
    const requiredPermissions = (() => {
        switch (action) {
            case 'list':
                return HR_PERMISSION_PROFILE.CHECKLIST_TEMPLATE_LIST;
            case 'create':
                return HR_PERMISSION_PROFILE.CHECKLIST_TEMPLATE_CREATE;
            case 'update':
                return HR_PERMISSION_PROFILE.CHECKLIST_TEMPLATE_UPDATE;
            case 'delete':
                return HR_PERMISSION_PROFILE.CHECKLIST_TEMPLATE_DELETE;
        }
    })();

    const actionValue = (() => {
        switch (action) {
            case 'list':
                return HR_ACTION.LIST;
            case 'create':
                return HR_ACTION.CREATE;
            case 'update':
                return HR_ACTION.UPDATE;
            case 'delete':
                return HR_ACTION.DELETE;
        }
    })();

    const { authorization } = await getSessionContext({}, {
        headers: request.headers,
        requiredPermissions,
        auditSource,
        action: actionValue,
        resourceType: HR_RESOURCE_TYPE.CHECKLIST_TEMPLATE,
        resourceAttributes,
    });

    return authorization;
}

async function readJson<T = unknown>(request: Request, fallback: T): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        return fallback;
    }
}

function handleZodError(message: string, error: unknown): never {
    if (error instanceof ZodError) {
        throw new ValidationError(message, {
            issues: error.issues,
        });
    }

    throw error;
}

function parseOrThrow<T>(schema: ZodType<T>, payload: unknown, message: string): T {
    const result = schema.safeParse(payload);
    if (result.success) {
        return result.data;
    }

    return handleZodError(message, result.error);
}

function parseTemplateFilters(url: URL): ChecklistTemplateListFilters {
    return parseOrThrow(
        checklistTemplateListFilterSchema,
        Object.fromEntries(url.searchParams.entries()),
        'Invalid checklist template filters.',
    );
}

function parseTemplatePayload(raw: unknown): ChecklistTemplateCreatePayload {
    return parseOrThrow(checklistTemplateCreateSchema, raw, 'Invalid checklist template payload.');
}

function parseTemplateUpdates(raw: unknown): ChecklistTemplateUpdatePayload {
    return parseOrThrow(checklistTemplateUpdateSchema, raw, 'Invalid checklist template update payload.');
}

function parseTemplateIdentifier(templateId: unknown): string {
    return parseOrThrow(checklistTemplateIdSchema, templateId, 'Invalid checklist template identifier.');
}

export async function listChecklistTemplatesController(request: Request): Promise<ChecklistTemplateListResult> {
    const url = new URL(request.url);
    const filters = parseTemplateFilters(url);

    const authorization = await authorizeTemplateRequest(request, 'api:hr:onboarding:templates:list', 'list', {
        typeFilter: filters.type ?? null,
    });

    const result = await listChecklistTemplates(
        { checklistTemplateRepository },
        { authorization, type: filters.type },
    );

    return { success: true, data: { templates: result.templates } };
}

export async function createChecklistTemplateController(
    request: Request,
): Promise<ChecklistTemplateMutationResult> {
    const raw = await readJson<Record<string, unknown>>(request, {});
    const template = parseTemplatePayload(raw);

    const authorization = await authorizeTemplateRequest(request, 'api:hr:onboarding:templates:create', 'create', {
        templateName: template.name,
        templateType: template.type,
        itemCount: template.items.length,
    });

    const result = await createChecklistTemplate(
        { checklistTemplateRepository },
        { authorization, template },
    );

    await invalidateOrgCache(
        authorization.orgId,
        CACHE_SCOPE_CHECKLIST_TEMPLATES,
        authorization.dataClassification,
        authorization.dataResidency,
    );

    return { success: true, data: { template: result.template } };
}

export async function updateChecklistTemplateController(
    request: Request,
    templateId: string,
): Promise<ChecklistTemplateMutationResult> {
    const parsedTemplateId = parseTemplateIdentifier(templateId);
    const raw = await readJson<Record<string, unknown>>(request, {});
    const updates = parseTemplateUpdates(raw);

    const authorization = await authorizeTemplateRequest(request, 'api:hr:onboarding:templates:update', 'update', {
        templateId: parsedTemplateId,
        updateKeys: Object.keys(updates),
        itemCount: updates.items?.length,
    });

    const result = await updateChecklistTemplate(
        { checklistTemplateRepository },
        {
            authorization,
            templateId: parsedTemplateId,
            updates,
        },
    );

    await invalidateOrgCache(
        authorization.orgId,
        CACHE_SCOPE_CHECKLIST_TEMPLATES,
        authorization.dataClassification,
        authorization.dataResidency,
    );

    return { success: true, data: { template: result.template } };
}

export async function deleteChecklistTemplateController(
    request: Request,
    templateId: string,
): Promise<ChecklistTemplateDeleteResult> {
    const parsedTemplateId = parseTemplateIdentifier(templateId);

    const authorization = await authorizeTemplateRequest(request, 'api:hr:onboarding:templates:delete', 'delete', {
        templateId: parsedTemplateId,
    });

    await deleteChecklistTemplate(
        { checklistTemplateRepository },
        {
            authorization,
            templateId: parsedTemplateId,
        },
    );

    await invalidateOrgCache(
        authorization.orgId,
        CACHE_SCOPE_CHECKLIST_TEMPLATES,
        authorization.dataClassification,
        authorization.dataResidency,
    );

    return { success: true };
}

