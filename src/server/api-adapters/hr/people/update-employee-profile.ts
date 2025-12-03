import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateEmployeeProfileInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeProfileChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';

export type UpdateEmployeeProfileApiInput = Infer<typeof updateEmployeeProfileInputSchema>;

export interface UpdateEmployeeProfileApiResponse {
  success: boolean;
  data?: { profileId: string };
  error?: string;
}

// API adapter: update an employee profile via PeopleService with guard enforcement.
export async function updateEmployeeProfileAdapter(
  req: NextApiRequest,
  res: NextApiResponse<UpdateEmployeeProfileApiResponse>,
): Promise<void> {
  try {
    const input = updateEmployeeProfileInputSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredRoles: ['orgAdmin'],
        auditSource: 'api:hr:people:update-employee-profile',
        action: 'update',
        resourceType: 'employeeProfile',
        resourceAttributes: { profileId: input.profileId, updateKeys: Object.keys(input.changes) },
      },
    );

    const peopleService = getPeopleService();
    const profileUpdates = normalizeProfileChanges(input.changes);
    const result = await peopleService.updateEmployeeProfile({
      authorization,
      payload: {
        profileId: input.profileId,
        profileUpdates,
      },
    });

    res.status(200).json({ success: true, data: { profileId: result.profileId } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
