import type { OrgAuthorizationContext, OrgAuthorizationEngine, OrgAuthorizationInput } from './types';
import { DEFAULT_ORG_AUTHORIZATION_ENGINE } from './default-org-authorization-engine';

let engine: OrgAuthorizationEngine = DEFAULT_ORG_AUTHORIZATION_ENGINE;

/**
 * Single swap point for authorization behavior.
 * Future RBAC/ABAC engines can be injected here without changing call sites.
 */
export function getOrgAuthorizationEngine(): OrgAuthorizationEngine {
    return engine;
}

/** For tests / local experiments only. */
export function setOrgAuthorizationEngineForTests(next: OrgAuthorizationEngine): void {
    engine = next;
}

export function authorizeOrgAccessRbacOnly(input: OrgAuthorizationInput, context: OrgAuthorizationContext): void {
    const authorizer = getOrgAuthorizationEngine();
    authorizer.assertTenantConstraints(input, context);
    authorizer.assertRbac(input, context);
}

export async function authorizeOrgAccessAbacOnly(
    input: OrgAuthorizationInput,
    context: OrgAuthorizationContext,
): Promise<void> {
    const authorizer = getOrgAuthorizationEngine();
    await authorizer.assertAbac(input, context);
}
