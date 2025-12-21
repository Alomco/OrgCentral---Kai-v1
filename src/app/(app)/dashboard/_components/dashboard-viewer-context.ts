import type { AuthSession } from '@/server/lib/auth';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export interface DashboardViewerContext {
    session: NonNullable<AuthSession>;
    baseAuthorization: RepositoryAuthorizationContext;
}

