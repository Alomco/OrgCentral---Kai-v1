import { createAuth } from '@/server/lib/auth-config';
import { resolveAuthBaseURL } from '@/server/lib/auth-environment';

export { createAuth };

export const auth = createAuth(resolveAuthBaseURL());

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
