import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateEmploymentContractInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeContractChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type UpdateEmploymentContractApiInput = Infer<typeof updateEmploymentContractInputSchema>;

export interface UpdateEmploymentContractApiResponse {
  success: boolean;
  data?: { contractId: string };
  error?: string;
}

// API adapter: update an employment contract via PeopleService with guard enforcement.
export async function updateEmploymentContractAdapter(
  req: NextApiRequest,
  res: NextApiResponse<UpdateEmploymentContractApiResponse>,
): Promise<void> {
  try {
    const input = updateEmploymentContractInputSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredPermissions: { employmentContract: ['update'] },
        auditSource: 'api:hr:people:employment:update-contract',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
        resourceAttributes: { contractId: input.contractId, updateKeys: Object.keys(input.changes) },
      },
    );

    const peopleService = getPeopleService();
    const contractUpdates = normalizeContractChanges(input.changes);
    const result = await peopleService.updateEmploymentContract({
      authorization,
      payload: {
        contractId: input.contractId,
        contractUpdates,
      },
    });

    res.status(200).json({ success: true, data: { contractId: result.contractId } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
