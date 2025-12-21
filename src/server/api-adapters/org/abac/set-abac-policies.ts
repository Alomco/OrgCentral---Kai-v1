import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';
import { setAbacPolicies as setAbacPoliciesUseCase } from '@/server/use-cases/org/abac/set-abac-policies';
import { ValidationError } from '@/server/errors';

const AUDIT_SOURCE = 'api:org:abac:set';

export interface SetAbacPoliciesRouteInput {
  headers: Headers | HeadersInit;
  orgId: string;
  body: unknown;
}

export async function setAbacPoliciesRouteController(
  input: SetAbacPoliciesRouteInput,
) {
  const orgId = input.orgId.trim();
  if (!orgId) {
    throw new ValidationError('Organization id is required.');
  }

  const policies: unknown[] = Array.isArray(input.body)
    ? (input.body as unknown[])
    : (() => {
      if (!input.body || typeof input.body !== 'object') {
        return [];
      }

      const record = input.body as Record<string, unknown>;
      const payloadPolicies = record.policies;
      return Array.isArray(payloadPolicies) ? (payloadPolicies as unknown[]) : [];
    })();

  const { authorization } = await getSessionContext(
    {},
    {
      headers: input.headers,
      orgId,
      requiredPermissions: { organization: ['update'] },
      auditSource: AUDIT_SOURCE,
      action: 'org.abac.update',
      resourceType: 'org.abac.policy',
      resourceAttributes: { orgId, policyCount: Array.isArray(policies) ? policies.length : 0 },
    },
  );

  const repo = new PrismaAbacPolicyRepository();
  return setAbacPoliciesUseCase(
    { policyRepository: repo },
    {
      authorization,
      policies,
    },
  );
}
