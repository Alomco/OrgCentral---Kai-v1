import type { NextApiRequest, NextApiResponse } from 'next';
import type { infer as Infer } from 'zod';
import type { PeopleService } from '@/server/services/hr/people/people-service';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getEmploymentContractRequestSchema } from '@/server/types/hr-people-schemas';
import type { EmploymentContract } from '@/server/types/hr-types';

// API adapter: get an employment contract by id via contract repositories with RBAC/ABAC guard checks.

export type GetEmploymentContractApiInput = Infer<typeof getEmploymentContractRequestSchema>;

export interface GetEmploymentContractApiResponse {
  success: boolean;
  data?: {
    contract: EmploymentContract | null;
  };
  error?: string;
}

export async function getEmploymentContractAdapter(
  req: NextApiRequest,
  res: NextApiResponse<GetEmploymentContractApiResponse>,
  peopleService: PeopleService,
): Promise<void> {
  try {
    // Validate the request body
    const input = getEmploymentContractRequestSchema.parse(req.body);

    // Get session context
    const { authorization } = await getSessionContext({}, {
      headers: new Headers(req.headers as unknown as HeadersInit),
      requiredRoles: ['member'],
      auditSource: 'api:hr:people:employment:get-contract',
      action: 'read',
      resourceType: 'employmentContract',
      resourceAttributes: {
        contractId: input.contractId,
      },
    });

    // Call the service with new input structure
    const result = await peopleService.getEmploymentContract({
      authorization,
      payload: {
        contractId: input.contractId,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        contract: result.contract,
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
