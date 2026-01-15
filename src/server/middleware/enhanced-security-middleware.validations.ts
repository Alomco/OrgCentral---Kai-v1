import type { NextApiRequest } from 'next';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { JsonValue } from '@/server/types/json';
import { validateDataCompliance } from '@/server/security/guards/data-residency-validation-guards';
import { assertPiiCompliance, detectPii } from '@/server/security/guards/pii-detection-protection-guards';
import { logSecurityEvent, mapHttpMethodToOperation } from './enhanced-security-middleware.helpers';

export async function checkDataResidency(
  context: RepositoryAuthorizationContext,
  req: NextApiRequest,
  requestUrl: string,
): Promise<string[] | null> {
  const residencyValidation = validateDataCompliance(
    context,
    undefined,
    undefined,
    `API access to ${requestUrl}`,
  );

  if (residencyValidation.isValid) {
    return null;
  }

  await logSecurityEvent(
    context,
    'security.middleware.blocked',
    'high',
    `Data residency validation failed: ${residencyValidation.violations.join(', ')}`,
    req,
  );

  return residencyValidation.violations;
}

export async function checkPiiAccess(
  context: RepositoryAuthorizationContext,
  req: NextApiRequest,
  requestBody: JsonValue | undefined,
): Promise<boolean> {
  const piiDetection = detectPii(requestBody);
  if (!piiDetection.hasPii) {
    return true;
  }

  try {
    const operation = mapHttpMethodToOperation(req.method);
    if (requestBody !== undefined) {
      assertPiiCompliance(context, requestBody, operation);
    }
    return true;
  } catch (piiError) {
    await logSecurityEvent(
      context,
      'security.pii.access.denied',
      'high',
      `PII access denied: ${(piiError as Error).message}`,
      req,
    );
    return false;
  }
}
