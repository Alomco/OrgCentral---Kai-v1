import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createEmploymentContractInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeContractChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type CreateEmploymentContractApiInput = Infer<typeof createEmploymentContractInputSchema>;

export interface CreateEmploymentContractApiResponse {
  success: boolean;
  data?: { contractId: string };
  error?: string;
}

// API adapter: create an employment contract via PeopleService
export async function createEmploymentContractAdapter(
  req: NextApiRequest,
  res: NextApiResponse<CreateEmploymentContractApiResponse>,
): Promise<void> {
  try {
    const input = createEmploymentContractInputSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredPermissions: { employmentContract: ['create'] },
        auditSource: 'api:hr:people:employment:create-contract',
        action: HR_ACTION.CREATE,
        resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
        resourceAttributes: {
          targetUserId: input.targetUserId,
          contractType: input.changes.contractType,
          jobTitle: input.changes.jobTitle,
        },
      },
    );

    const peopleService = getPeopleService();
    const contractData = normalizeContractChanges(input.changes);
    const result = await peopleService.createEmploymentContract({
      authorization,
      payload: {
        contractData: {
          ...contractData,
          userId: input.targetUserId,
          contractType: input.changes.contractType,
          jobTitle: input.changes.jobTitle,
          startDate: input.changes.startDate,
        },
      },
    });

    res.status(200).json({ success: true, data: { contractId: result.contractId } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
