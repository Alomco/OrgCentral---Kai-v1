import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createEmployeeProfileInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeProfileChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';

// API adapter: create an employee profile via people repositories with RBAC/ABAC authorization safeguards.

export type CreateEmployeeProfileApiInput = Infer<typeof createEmployeeProfileInputSchema>;

export interface CreateEmployeeProfileApiResponse {
  success: boolean;
  data?: {
    profileId: string;
  };
  error?: string;
}

export async function createEmployeeProfileAdapter(
  req: NextApiRequest,
  res: NextApiResponse<CreateEmployeeProfileApiResponse>,
): Promise<void> {
  try {
    // Validate the request body
    const input = createEmployeeProfileInputSchema.parse(req.body);

    // Get session context
    const { authorization } = await getSessionContext({}, {
      headers: new Headers(req.headers as unknown as HeadersInit),
      requiredRoles: ['orgAdmin'],
      auditSource: 'api:hr:people:create-employee-profile',
      action: 'create',
      resourceType: 'employeeProfile',
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
