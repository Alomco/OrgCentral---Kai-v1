import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import {
  createEmployeeProfileInputSchema,
  getEmployeeProfileRequestSchema,
  listEmployeeProfilesRequestSchema,
  updateEmployeeProfileInputSchema,
} from '@/server/types/hr-people-schemas';
import type { EmployeeProfile } from '@/server/types/hr-types';
import {
  normalizeProfileChanges,
} from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import {
  normalizeEmploymentStatus,
  normalizeEmploymentType,
} from '@/server/services/hr/people/helpers/normalization.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

interface ListProfilesResult {
  success: true;
  data: { profiles: EmployeeProfile[] };
}

interface CreateProfileResult {
  success: true;
  data: { profileId: string };
}

interface GetProfileResult {
  success: true;
  data: { profile: EmployeeProfile | null };
}

interface UpdateProfileResult {
  success: true;
  data: { profileId: string };
}

interface DeleteProfileResult {
  success: true;
}

async function readJson<T = unknown>(request: Request, fallback: T): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    return fallback;
  }
}

export async function listProfilesController(request: Request): Promise<ListProfilesResult> {
  const raw = await readJson<Record<string, unknown>>(request, {});
  const input = listEmployeeProfilesRequestSchema.parse({
    ...raw,
    filters: raw.filters
      ? {
        ...raw.filters as Record<string, unknown>,
        employmentStatus: normalizeEmploymentStatus((raw.filters as Record<string, unknown>).employmentStatus),
      }
      : undefined,
  });

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employeeProfile: ['list'] },
    auditSource: 'api:hr:people:profiles:list',
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
    resourceAttributes: { filterCount: Object.keys(input.filters ?? {}).length, filters: input.filters },
  });

  const service = getPeopleService();
  const result = await service.listEmployeeProfiles({
    authorization,
    payload: { filters: input.filters },
  });

  return { success: true, data: { profiles: result.profiles } };
}

export async function createProfileController(request: Request): Promise<CreateProfileResult> {
  const raw = await readJson<Record<string, unknown>>(request, {});
  const normalized = {
    ...raw,
    changes: raw.changes
      ? {
        ...raw.changes as Record<string, unknown>,
        employmentType: normalizeEmploymentType((raw.changes as Record<string, unknown>).employmentType),
        employmentStatus: normalizeEmploymentStatus((raw.changes as Record<string, unknown>).employmentStatus),
      }
      : raw.changes,
  };
  const input = createEmployeeProfileInputSchema.parse(normalized);

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employeeProfile: ['create'] },
    auditSource: 'api:hr:people:profiles:create',
    action: HR_ACTION.CREATE,
    resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
    resourceAttributes: {
      targetUserId: input.targetUserId,
      jobTitle: input.changes.jobTitle,
      employmentType: input.changes.employmentType,
    },
  });

  const service = getPeopleService();
  const profileData = normalizeProfileChanges(input.changes);
  const result = await service.createEmployeeProfile({
    authorization,
    payload: {
      profileData: {
        ...profileData,
        userId: input.targetUserId,
        employeeNumber: input.changes.employeeNumber,
        employmentType: input.changes.employmentType,
      },
    },
  });

  return { success: true, data: { profileId: result.profileId } };
}

export async function getProfileController(
  request: Request,
  profileId: string,
): Promise<GetProfileResult> {
  const input = getEmployeeProfileRequestSchema.parse({ profileId });

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employeeProfile: ['read'] },
    auditSource: 'api:hr:people:profiles:get',
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
    resourceAttributes: { profileId: input.profileId },
  });

  const service = getPeopleService();
  const result = await service.getEmployeeProfile({
    authorization,
    payload: { profileId: input.profileId },
  });

  return { success: true, data: { profile: result.profile } };
}

export async function updateProfileController(
  request: Request,
  profileId: string,
): Promise<UpdateProfileResult> {
  const raw = await readJson<Record<string, unknown>>(request, {});
  const parsed = updateEmployeeProfileInputSchema.parse({
    ...raw,
    profileId,
    changes: raw.changes
      ? {
        ...raw.changes as Record<string, unknown>,
        employmentType: normalizeEmploymentType((raw.changes as Record<string, unknown>).employmentType),
        employmentStatus: normalizeEmploymentStatus((raw.changes as Record<string, unknown>).employmentStatus),
      }
      : raw.changes,
  });

  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employeeProfile: ['update'] },
    auditSource: 'api:hr:people:profiles:update',
    action: HR_ACTION.UPDATE,
    resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
    resourceAttributes: { profileId: parsed.profileId, updateKeys: Object.keys(parsed.changes) },
  });

  const service = getPeopleService();
  const normalizedUpdates = normalizeProfileChanges(parsed.changes);
  const result = await service.updateEmployeeProfile({
    authorization,
    payload: { profileId: parsed.profileId, profileUpdates: normalizedUpdates },
  });

  return { success: true, data: { profileId: result.profileId } };
}

export async function deleteProfileController(
  request: Request,
  profileId: string,
): Promise<DeleteProfileResult> {
  const { authorization } = await getSessionContext({}, {
    headers: request.headers,
    requiredPermissions: { employeeProfile: ['delete'] },
    auditSource: 'api:hr:people:profiles:delete',
    action: HR_ACTION.DELETE,
    resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
    resourceAttributes: { profileId },
  });

  const service = getPeopleService();
  await service.deleteEmployeeProfile({
    authorization,
    payload: { profileId },
  });

  return { success: true };
}
