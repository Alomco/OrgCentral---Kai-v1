import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import {
  createEmploymentContractInputSchema,
  getEmploymentContractRequestSchema,
  listEmploymentContractsRequestSchema,
  updateEmploymentContractInputSchema,
} from '@/server/types/hr-people-schemas';
import type { EmploymentContract } from '@/server/types/hr-types';
import {
  normalizeContractChanges,
} from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import {
  normalizeContractPayload,
  normalizeContractType,
} from '@/server/services/hr/people/helpers/normalization.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

interface ListContractsResult {
  success: true;
  data: { contracts: EmploymentContract[] };
}

interface CreateContractResult {
  success: true;
  data: { contractId: string };
}

interface GetContractResult {
  success: true;
  data: { contract: EmploymentContract | null };
}

interface UpdateContractResult {
  success: true;
  data: { contractId: string };
}

interface DeleteContractResult {
  success: true;
}

async function readJson<T = unknown>(request: Request, fallback: T): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    return fallback;
  }
}

export async function listContractsController(request: Request): Promise<ListContractsResult> {
  const raw = await readJson<Record<string, unknown>>(request, {});
  const input = listEmploymentContractsRequestSchema.parse({
    ...raw,
    filters: raw.filters
      ? {
        ...raw.filters,
        contractType: normalizeContractType((raw.filters as Record<string, unknown>).contractType),
      }
      : undefined,
  });

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employmentContract: ['list'] },
    auditSource: 'api:hr:people:contracts:list',
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
    resourceAttributes: { filterCount: Object.keys(input.filters ?? {}).length, filters: input.filters },
  });

  const service = getPeopleService();
  const result = await service.listEmploymentContracts({
    authorization,
    payload: { filters: input.filters },
  });

  return { success: true, data: { contracts: result.contracts } };
}

export async function createContractController(request: Request): Promise<CreateContractResult> {
  const raw = await readJson<Record<string, unknown>>(request, {});
  const normalized = {
    ...raw,
    changes: raw.changes ? normalizeContractPayload(raw.changes as Record<string, unknown>) : raw.changes,
  };
  const input = createEmploymentContractInputSchema.parse(normalized);

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employmentContract: ['create'] },
    auditSource: 'api:hr:people:contracts:create',
    action: HR_ACTION.CREATE,
    resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
    resourceAttributes: {
      targetUserId: input.targetUserId,
      contractType: input.changes.contractType,
      jobTitle: input.changes.jobTitle,
    },
  });

  const service = getPeopleService();
  const contractData = normalizeContractChanges(input.changes);
  const result = await service.createEmploymentContract({
    authorization,
    payload: {
      contractData: {
        ...contractData,
        userId: input.targetUserId,
        contractType: input.changes.contractType,
        jobTitle: input.changes.jobTitle,
        startDate: input.changes.startDate,
      },
    },
  });

  return { success: true, data: { contractId: result.contractId } };
}

export async function getContractController(
  request: Request,
  contractId: string,
): Promise<GetContractResult> {
  const input = getEmploymentContractRequestSchema.parse({ contractId });

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employmentContract: ['read'] },
    auditSource: 'api:hr:people:contracts:get',
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
    resourceAttributes: { contractId: input.contractId },
  });

  const service = getPeopleService();
  const result = await service.getEmploymentContract({
    authorization,
    payload: { contractId: input.contractId },
  });

  return { success: true, data: { contract: result.contract } };
}

export async function updateContractController(
  request: Request,
  contractId: string,
): Promise<UpdateContractResult> {
  const raw = await readJson<Record<string, unknown>>(request, {});
  const parsed = updateEmploymentContractInputSchema.parse({
    ...raw,
    contractId,
    changes: raw.changes ? normalizeContractPayload(raw.changes as Record<string, unknown>) : raw.changes,
  });

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employmentContract: ['update'] },
    auditSource: 'api:hr:people:contracts:update',
    action: HR_ACTION.UPDATE,
    resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
    resourceAttributes: { contractId: parsed.contractId, updateKeys: Object.keys(parsed.changes) },
  });

  const service = getPeopleService();
  const contractUpdates = normalizeContractChanges(parsed.changes);
  const result = await service.updateEmploymentContract({
    authorization,
    payload: { contractId: parsed.contractId, contractUpdates },
  });

  return { success: true, data: { contractId: result.contractId } };
}

export async function deleteContractController(
  request: Request,
  contractId: string,
): Promise<DeleteContractResult> {
  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employmentContract: ['delete'] },
    auditSource: 'api:hr:people:contracts:delete',
    action: HR_ACTION.DELETE,
    resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
    resourceAttributes: { contractId },
  });

  const service = getPeopleService();
  await service.deleteEmploymentContract({
    authorization,
    payload: { contractId },
  });

  return { success: true };
}
