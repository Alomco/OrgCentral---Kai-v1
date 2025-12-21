import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { deleteEmployeeProfileInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type DeleteEmployeeProfileApiInput = Infer<typeof deleteEmployeeProfileInputSchema>;

export interface DeleteEmployeeProfileApiResponse {
  success: boolean;
  error?: string;
}

// API adapter: delete an employee profile via PeopleService with guard enforcement.
export async function deleteEmployeeProfileAdapter(
  req: NextApiRequest,
  res: NextApiResponse<DeleteEmployeeProfileApiResponse>,
): Promise<void> {
  try {
    const input = deleteEmployeeProfileInputSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredPermissions: { employeeProfile: ['delete'] },
        auditSource: 'api:hr:people:delete-employee-profile',
        action: HR_ACTION.DELETE,
        resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
        resourceAttributes: { profileId: input.profileId },
      },
    );

    const peopleService = getPeopleService();
    await peopleService.deleteEmployeeProfile({
      authorization,
      payload: { profileId: input.profileId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
