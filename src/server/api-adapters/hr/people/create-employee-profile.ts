import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createEmployeeProfileInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import {
  normalizeProfileChanges,
} from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import {
  normalizeEmploymentStatus,
  normalizeEmploymentType,
} from '@/server/services/hr/people/helpers/normalization.helpers';

// API adapter: create an employee profile via people repositories with RBAC/ABAC authorization safeguards.

export type CreateEmployeeProfileApiInput = Infer<typeof createEmployeeProfileInputSchema>;

export interface CreateEmployeeProfileApiResponse {
  success: boolean;
  data?: {
    profileId: string;
  };
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function createEmployeeProfileAdapter(
  req: NextApiRequest,
  res: NextApiResponse<CreateEmployeeProfileApiResponse>,
): Promise<void> {
  try {
    const requestBody: unknown = req.body;
    const body = isRecord(requestBody) ? requestBody : {};
    const changes = isRecord(body.changes) ? body.changes : undefined;

    const employmentTypeRaw = changes?.employmentType;
    const employmentStatusRaw = changes?.employmentStatus;

    const normalizedBody: Record<string, unknown> = {
      ...body,
      ...(changes
        ? {
          changes: {
            ...changes,
            employmentType:
              typeof employmentTypeRaw === 'string'
                ? normalizeEmploymentType(employmentTypeRaw)
                : employmentTypeRaw,
            employmentStatus:
              typeof employmentStatusRaw === 'string'
                ? normalizeEmploymentStatus(employmentStatusRaw)
                : employmentStatusRaw,
          },
        }
        : {}),
    };
    const input = createEmployeeProfileInputSchema.parse(normalizedBody);

    // Get session context
    const { authorization } = await getSessionContext({}, {
      headers: new Headers(req.headers as unknown as HeadersInit),
      requiredPermissions: { employeeProfile: ['create'] },
      auditSource: 'api:hr:people:create-employee-profile',
      action: HR_ACTION.CREATE,
      resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
      resourceAttributes: {
        targetUserId: input.targetUserId,
        jobTitle: input.changes.jobTitle,
        employmentType: input.changes.employmentType,
      },
    });

    // Call the service with new input structure
    const peopleService = getPeopleService();
    const profileData = normalizeProfileChanges(input.changes);
    const result = await peopleService.createEmployeeProfile({
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

    res.status(200).json({
      success: true,
      data: {
        profileId: result.profileId,
      },
    });
  } catch (error) {
    // Handle validation and other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
}
