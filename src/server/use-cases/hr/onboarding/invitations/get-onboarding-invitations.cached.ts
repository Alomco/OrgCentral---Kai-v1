import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_ONBOARDING_INVITATIONS } from '@/server/repositories/cache-scopes';
import type { IOnboardingInvitationRepository, OnboardingInvitation, OnboardingInvitationStatus } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getOnboardingInvitationRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { listOnboardingInvitations } from './list-onboarding-invitations';

export interface GetOnboardingInvitationsForUiInput {
    authorization: RepositoryAuthorizationContext;
    status?: OnboardingInvitationStatus;
    limit?: number;
}

export interface GetOnboardingInvitationsForUiResult {
    invitations: OnboardingInvitation[];
}

function resolveInvitationRepository(): IOnboardingInvitationRepository {
    return getOnboardingInvitationRepository();
}

export async function getOnboardingInvitationsForUi(
    input: GetOnboardingInvitationsForUiInput,
): Promise<GetOnboardingInvitationsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.ONBOARDING_INVITE,
        payload: {
            status: input.status ?? null,
            limit: input.limit ?? null,
        },
    });
    async function getInvitationsCached(
        cachedInput: GetOnboardingInvitationsForUiInput,
    ): Promise<GetOnboardingInvitationsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        registerOrgCacheTag(
            cachedInput.authorization.orgId,
            CACHE_SCOPE_ONBOARDING_INVITATIONS,
            cachedInput.authorization.dataClassification,
            cachedInput.authorization.dataResidency,
        );

        return listOnboardingInvitations(
            { onboardingInvitationRepository: resolveInvitationRepository() },
            cachedInput,
        );
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return listOnboardingInvitations(
            { onboardingInvitationRepository: resolveInvitationRepository() },
            input,
        );
    }

    return getInvitationsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
