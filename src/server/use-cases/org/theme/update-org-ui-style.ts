import { AuthorizationError } from '@/server/errors';
import type { IThemeRepository } from '@/server/repositories/contracts/org/theme/theme-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_TENANT_THEME } from '@/server/repositories/cache-scopes';
import type { UiStyleKey } from '@/server/theme/ui-style-presets';

export interface UpdateOrgUiStyleDependencies {
    themeRepository: IThemeRepository;
}

export interface UpdateOrgUiStyleInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
    uiStyleId: UiStyleKey;
}

export interface UpdateOrgUiStyleResult {
    uiStyleId: UiStyleKey;
}

export async function updateOrgUiStyle(
    deps: UpdateOrgUiStyleDependencies,
    input: UpdateOrgUiStyleInput,
): Promise<UpdateOrgUiStyleResult> {
    if (input.orgId !== input.authorization.orgId) {
        throw new AuthorizationError('Cross-tenant ui style update denied.');
    }

    await deps.themeRepository.updateTheme(input.orgId, { uiStyleId: input.uiStyleId });

    await invalidateOrgCache(
        input.authorization.orgId,
        CACHE_SCOPE_TENANT_THEME,
        input.authorization.dataClassification,
        input.authorization.dataResidency,
    );

    return { uiStyleId: input.uiStyleId };
}
