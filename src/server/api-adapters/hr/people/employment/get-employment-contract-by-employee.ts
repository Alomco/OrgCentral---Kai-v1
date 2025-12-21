import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getEmploymentContractByEmployeeRequestSchema } from '@/server/types/hr-people-schemas';
import type { EmploymentContract } from '@/server/types/hr-types';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type GetEmploymentContractByEmployeeApiInput = Infer<typeof getEmploymentContractByEmployeeRequestSchema>;

export interface GetEmploymentContractByEmployeeApiResponse {
  success: boolean;
  data?: { contract: EmploymentContract | null };
  error?: string;
}

// API adapter: get an employment contract by employee id via PeopleService with guard enforcement.
export async function getEmploymentContractByEmployeeAdapter(
  req: NextApiRequest,
  res: NextApiResponse<GetEmploymentContractByEmployeeApiResponse>,
): Promise<void> {
  try {
    const input = getEmploymentContractByEmployeeRequestSchema.parse(req.body);

    const { authorization } = await getSessionContext(
      {},
      {
        headers: new Headers(req.headers as unknown as HeadersInit),
        requiredPermissions: { employmentContract: ['read'] },
        auditSource: 'api:hr:people:employment:get-contract-by-employee',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
        resourceAttributes: { employeeId: input.employeeId },
      },
    );

    const peopleService = getPeopleService();
    const result = await peopleService.getEmploymentContractByEmployee({
      authorization,
      payload: { employeeId: input.employeeId },
    });

    res.status(200).json({ success: true, data: { contract: result.contract } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
}
