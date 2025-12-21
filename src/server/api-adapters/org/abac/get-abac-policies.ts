import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';
import { getAbacPolicies as getAbacPoliciesUseCase } from '@/server/use-cases/org/abac/get-abac-policies';
import { ValidationError } from '@/server/errors';

const AUDIT_SOURCE = 'api:org:abac:get';

export interface GetAbacPoliciesRouteInput {
  headers: Headers | HeadersInit;
  orgId: string;
}

export async function getAbacPoliciesRouteController(
  request: GetAbacPoliciesRouteInput,
) {
  const orgId = request.orgId.trim();
  if (!orgId) {
    throw new ValidationError('Organization id is required.');
  }

  const { authorization } = await getSessionContext(
    {},
    {
      headers: request.headers,
      orgId,
      requiredPermissions: { organization: ['update'] },
      auditSource: AUDIT_SOURCE,
      action: 'org.abac.read',
      resourceType: 'org.abac.policy',
      resourceAttributes: { orgId },
    },
  );

  const repo = new PrismaAbacPolicyRepository();
  return getAbacPoliciesUseCase(
    { policyRepository: repo },
    { authorization },
  );
}
