import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { deleteEmploymentContractInputSchema } from '@/server/types/hr-people-schemas';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';

export type DeleteEmploymentContractApiInput = Infer<typeof deleteEmploymentContractInputSchema>;

export interface DeleteEmploymentContractApiResponse {
  success: boolean;
  error?: string;
}

// API adapter: delete an employment contract via PeopleService with guard enforcement.
export async function deleteEmploymentContractAdapter(
  req: NextApiRequest,
  res: NextApiResponse<DeleteEmploymentContractApiResponse>,
): Promise<void> {
  try {
    const input = deleteEmploymentContractInputSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredRoles: ['orgAdmin'],
        auditSource: 'api:hr:people:employment:delete-contract',
        action: 'delete',
        resourceType: 'employmentContract',
        resourceAttributes: { contractId: input.contractId },
      },
    );

    const peopleService = getPeopleService();
    await peopleService.deleteEmploymentContract({
      authorization,
      payload: { contractId: input.contractId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
