import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

const CACHE_SAFE_CORRELATION_ID = '00000000-0000-0000-0000-000000000000';

export function toCacheSafeAuthorizationContext(
    authorization: RepositoryAuthorizationContext,
): RepositoryAuthorizationContext {
    const {
        correlationId,
        sessionToken,
        sessionId,
        ipAddress,
        userAgent,
        authenticatedAt,
        sessionExpiresAt,
        lastActivityAt,
        authorizedAt,
        authorizationReason,
        securityEventLogger,
        ...safeAuthorization
    } = authorization;

    void sessionToken;
    void sessionId;
    void ipAddress;
    void userAgent;
    void authenticatedAt;
    void sessionExpiresAt;
    void lastActivityAt;
    void authorizedAt;
    void authorizationReason;
    void securityEventLogger;

    if (correlationId === CACHE_SAFE_CORRELATION_ID) {
        return safeAuthorization as RepositoryAuthorizationContext;
    }

    return {
        ...safeAuthorization,
        correlationId: CACHE_SAFE_CORRELATION_ID,
    } as RepositoryAuthorizationContext;
}
