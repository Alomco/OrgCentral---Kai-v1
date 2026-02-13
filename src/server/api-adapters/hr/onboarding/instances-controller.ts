import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getEmployeeChecklists } from '@/server/use-cases/hr/onboarding/instances/get-employee-checklists';
import { updateChecklistInstance } from '@/server/use-cases/hr/onboarding/instances/update-checklist-instance';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { parseChecklistInstanceIdentifier } from '@/server/validators/hr/onboarding/checklist-instance-validators';
import { getChecklistInstanceRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';

interface GetEmployeeChecklistsResult {
    success: true;
    data: { instances: ChecklistInstance[] };
}

interface UpdateChecklistInstanceResult {
    success: true;
    data: { instance: ChecklistInstance };
}

const checklistInstanceRepository = getChecklistInstanceRepository();

async function authorizeRequest(
    request: Request,
    auditSource: string,
    action: 'list' | 'update',
    resourceAttributes?: Record<string, unknown>,
) {
    return getSessionContext({}, {
        headers: request.headers,
        requiredPermissions: action === 'list'
            ? HR_PERMISSION_PROFILE.ONBOARDING_CHECKLIST_LIST
            : HR_PERMISSION_PROFILE.ONBOARDING_CHECKLIST_UPDATE,
        auditSource,
        action: action === 'list' ? HR_ACTION.LIST : HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE_TYPE.ONBOARDING_CHECKLIST,
        resourceAttributes,
    }).then(context => context.authorization);
}

async function readJson<T = unknown>(request: Request, fallback: T): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        return fallback;
    }
}

export async function getEmployeeChecklistsController(request: Request): Promise<GetEmployeeChecklistsResult> {
    const url = new URL(request.url);
    // If getting for self, employeeId is inferred from session, OR passed as param for admins.
    // For this API /hr/onboarding/instances, let's assume it returns instances for the current logged-in user 
    // UNLESS an 'employeeId' query param is provided (and authorized).

    // However, the route.ts will determine this. Let's assume the controller takes request, extracting query params.
    const employeeIdParameter = url.searchParams.get('employeeId');

    const authorization = await authorizeRequest(request, 'api:hr:onboarding:instances:list', 'list', {
        targetEmployeeId: employeeIdParameter,
    });

    const targetEmployeeId = employeeIdParameter ?? authorization.userId; // Default to self

    const result = await getEmployeeChecklists(
        { checklistInstanceRepository },
        { authorization, employeeId: targetEmployeeId },
    );

    return { success: true, data: { instances: result.instances } };
}

export async function updateChecklistInstanceController(
    request: Request,
    instanceId: string,
): Promise<UpdateChecklistInstanceResult> {
    const parsedInstanceId = parseChecklistInstanceIdentifier(instanceId);
    const raw = await readJson<Record<string, unknown>>(request, {});

    const authorization = await authorizeRequest(request, 'api:hr:onboarding:instances:update', 'update', {
        instanceId: parsedInstanceId,
    });

    const result = await updateChecklistInstance(
        { checklistInstanceRepository },
        {
            authorization,
            instanceId: parsedInstanceId,
            updates: raw
        },
    );

    return { success: true, data: { instance: result.instance } };
}
