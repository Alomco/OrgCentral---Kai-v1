import type { EnhancedSecurityContext } from '@/server/types/enhanced-security-types';
import type { OrgAuthorizationEngine } from './engine/types';
import type {
  EnhancedOrgAuthorizationContext,
  EnhancedOrgAuthorizationInput,
} from './enhanced-org-authorization-engine.helpers';
import {
  assertEnhancedAbac,
  assertEnhancedRbac,
  assertEnhancedTenantConstraints,
  validateSessionSecurity,
} from './enhanced-org-authorization-engine.helpers';

export const ENHANCED_ORG_AUTHORIZATION_ENGINE: OrgAuthorizationEngine = {
  assertTenantConstraints: assertEnhancedTenantConstraints,
  assertRbac: assertEnhancedRbac,
  assertAbac: assertEnhancedAbac,
};

export async function executeEnhancedAuthorization(
  input: EnhancedOrgAuthorizationInput,
  context: EnhancedOrgAuthorizationContext,
): Promise<void> {
  validateSessionSecurity(input, context);
  assertEnhancedTenantConstraints(input, context);
  assertEnhancedRbac(input, context);
  await assertEnhancedAbac(input, context);
}

export function isEnhancedSecurityContext(
  context: object | null,
): context is EnhancedSecurityContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'mfaVerified' in context &&
    'requiresMfa' in context &&
    'ipAddress' in context &&
    'userAgent' in context
  );
}

export function isEnhancedAuthorizationInput(
  input: object | null,
): input is EnhancedOrgAuthorizationInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    'ipAddress' in input &&
    'userAgent' in input
  );
}
