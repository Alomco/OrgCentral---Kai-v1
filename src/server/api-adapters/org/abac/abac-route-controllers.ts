import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';
import { abacPolicySchema } from '@/server/security/abac-policy-normalizer';
import { getAbacPolicies, setAbacPolicies } from '@/server/services/org/abac/abac-service';

const AUDIT_SOURCE = {
  get: 'api:org:abac:get',
  set: 'api:org:abac:set',
} as const;

type AbacPolicyInput = z.infer<typeof abacPolicySchema>;
type AbacPoliciesPayload = AbacPolicyInput[] | { policies?: AbacPolicyInput[] } | Record<string, never>;

const abacPoliciesPayloadSchema = z.union([
  z.array(abacPolicySchema),
  z.object({ policies: z.array(abacPolicySchema).optional() }).strict(),
]);

export async function getOrgAbacPoliciesController(request: Request, orgId: string) {
  const normalizedOrgId = orgId.trim();
  if (!normalizedOrgId) {
    throw new ValidationError('Organization id is required.');
  }

  const { authorization } = await getSessionContext(
    {},
    {
      headers: request.headers,
      orgId: normalizedOrgId,
      requiredPermissions: { organization: ['update'] },
      auditSource: AUDIT_SOURCE.get,
      action: 'org.abac.read',
      resourceType: 'org.abac.policy',
      resourceAttributes: { orgId: normalizedOrgId },
    },
  );

  return getAbacPolicies(authorization);
}

export async function setOrgAbacPoliciesController(request: Request, orgId: string) {
  const normalizedOrgId = orgId.trim();
  if (!normalizedOrgId) {
    throw new ValidationError('Organization id is required.');
  }

  const body = await readJson<AbacPoliciesPayload>(request);
  const policies = parseAbacPoliciesPayload(body);

  const { authorization } = await getSessionContext(
    {},
    {
      headers: request.headers,
      orgId: normalizedOrgId,
      requiredPermissions: { organization: ['update'] },
      auditSource: AUDIT_SOURCE.set,
      action: 'org.abac.update',
      resourceType: 'org.abac.policy',
      resourceAttributes: { orgId: normalizedOrgId, policyCount: policies.length },
    },
  );

  return setAbacPolicies(authorization, policies);
}

function parseAbacPoliciesPayload(input: AbacPoliciesPayload): AbacPolicyInput[] {
  const parsed = abacPoliciesPayloadSchema.parse(input);
  return Array.isArray(parsed) ? parsed : parsed.policies ?? [];
}
