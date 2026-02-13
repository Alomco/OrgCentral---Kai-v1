import { AuthorizationError } from '@/server/errors';
import {
    buildAllowedMutationOrigins,
    isTrustedMutationOrigin,
    resolveMutationOrigin,
} from '@/server/security/origin-policy';

export function assertTrustedMutationOrigin(headerStore: Headers): void {
    const resolvedOrigin = resolveMutationOrigin(headerStore);
    const allowedOrigins = buildAllowedMutationOrigins({ headers: headerStore });

    if (isTrustedMutationOrigin(resolvedOrigin, allowedOrigins)) {
        return;
    }

    throw new AuthorizationError('Invalid origin.', { reason: 'origin_invalid' });
}
