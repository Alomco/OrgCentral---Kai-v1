import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import type { PeopleService } from '@/server/services/hr/people/people-service';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getEmployeeProfileByUserRequestSchema } from '@/server/types/hr-people-schemas';
import type { EmployeeProfile } from '@/server/types/hr-types';

// API adapter: get an employee profile by user id through people repositories with RBAC/ABAC guard checks.

export type GetEmployeeProfileByUserApiInput = Infer<typeof getEmployeeProfileByUserRequestSchema>;

export interface GetEmployeeProfileByUserApiResponse {
  success: boolean;
  data?: {
    profile: EmployeeProfile | null;
  };
  error?: string;
}

export async function getEmployeeProfileByUserAdapter(
  req: NextApiRequest,
  res: NextApiResponse<GetEmployeeProfileByUserApiResponse>,
  peopleService: PeopleService,
): Promise<void> {
  try {
    // Validate the request body
    const input = getEmployeeProfileByUserRequestSchema.parse(req.body);

    // Get session context
    const { authorization } = await getSessionContext({}, {
      headers: new Headers(req.headers as unknown as HeadersInit),
      requiredRoles: ['member'],
      auditSource: 'api:hr:people:get-employee-profile-by-user',
      action: 'read',
      resourceType: 'employeeProfile',
      resourceAttributes: {
        targetUserId: input.userId,
      },
    });

    // Call the service with new input structure
    const result = await peopleService.getEmployeeProfileByUser({
      authorization,
      payload: {
        userId: input.userId,
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
