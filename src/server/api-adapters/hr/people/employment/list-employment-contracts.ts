import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listEmploymentContractsRequestSchema } from '@/server/types/hr-people-schemas';
import type { EmploymentContract } from '@/server/types/hr-types';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type ListEmploymentContractsApiInput = Infer<typeof listEmploymentContractsRequestSchema>;

export interface ListEmploymentContractsApiResponse {
  success: boolean;
  data?: { contracts: EmploymentContract[] };
  error?: string;
}

// API adapter: list employment contracts via PeopleService with tenant guard.
export async function listEmploymentContractsAdapter(
  req: NextApiRequest,
  res: NextApiResponse<ListEmploymentContractsApiResponse>,
): Promise<void> {
  try {
    const input = listEmploymentContractsRequestSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredPermissions: { employmentContract: ['list'] },
        auditSource: 'api:hr:people:employment:list-contracts',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
        resourceAttributes: { filterCount: Object.keys(input.filters ?? {}).length, filters: input.filters },
      },
    );

    const peopleService = getPeopleService();
    const result = await peopleService.listEmploymentContracts({
      authorization,
      payload: { filters: input.filters },
    });

    res.status(200).json({ success: true, data: { contracts: result.contracts } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
