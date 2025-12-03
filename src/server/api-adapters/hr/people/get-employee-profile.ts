import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getEmployeeProfileRequestSchema } from '@/server/types/hr-people-schemas';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';

// API adapter: get an employee profile by id via people repositories under tenant authorization.

export type GetEmployeeProfileApiInput = Infer<typeof getEmployeeProfileRequestSchema>;

export interface GetEmployeeProfileApiResponse {
  success: boolean;
  data?: {
    profile: EmployeeProfile | null;
  };
  error?: string;
}

export async function getEmployeeProfileAdapter(
  req: NextApiRequest,
  res: NextApiResponse<GetEmployeeProfileApiResponse>,
): Promise<void> {
  try {
    // Validate the request body
    const input = getEmployeeProfileRequestSchema.parse(req.body);

    // Get session context
    const { authorization } = await getSessionContext({}, {
      headers: new Headers(req.headers as unknown as HeadersInit),
      requiredRoles: ['member'],
      auditSource: 'api:hr:people:get-employee-profile',
      action: 'read',
      resourceType: 'employeeProfile',
      resourceAttributes: {
        profileId: input.profileId,
      },
    });

    // Call the service with new input structure
    const peopleService = getPeopleService();
    const result = await peopleService.getEmployeeProfile({
      authorization,
      payload: {
        profileId: input.profileId,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        profile: result.profile,
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
