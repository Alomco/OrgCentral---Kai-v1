import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listEmployeeProfilesRequestSchema } from '@/server/types/hr-people-schemas';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';

export type ListEmployeeProfilesApiInput = Infer<typeof listEmployeeProfilesRequestSchema>;

export interface ListEmployeeProfilesApiResponse {
  success: boolean;
  data?: { profiles: EmployeeProfile[] };
  error?: string;
}

// API adapter: list employee profiles via PeopleService with tenant guard.
export async function listEmployeeProfilesAdapter(
  req: NextApiRequest,
  res: NextApiResponse<ListEmployeeProfilesApiResponse>,
): Promise<void> {
  try {
    const input = listEmployeeProfilesRequestSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredRoles: ['member'],
        auditSource: 'api:hr:people:list-employee-profiles',
        action: 'read',
        resourceType: 'employeeProfile',
        resourceAttributes: { filterCount: Object.keys(input.filters ?? {}).length, filters: input.filters },
      },
    );

    const peopleService = getPeopleService();
    const result = await peopleService.listEmployeeProfiles({
      authorization,
      payload: { filters: input.filters },
    });

    res.status(200).json({ success: true, data: { profiles: result.profiles } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
