import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { mcp, organization } from 'better-auth/plugins';
import { prisma } from '@/server/lib/prisma';
import { orgAccessControl, orgRoles } from '@/server/security/access-control';

const baseURL =
    process.env.AUTH_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const auth = betterAuth({
    baseURL,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    plugins: [
        organization({
            ac: orgAccessControl,
            roles: orgRoles,
            enforceUniqueSlug: true,
            allowUserToCreateOrganization: (user) => user.email.endsWith('.gov.uk'),
            schema: {
                session: {
                    fields: {
                        activeOrganizationId: 'activeOrganizationId',
                    },
                },
            },
        }),
        mcp({
            loginPage: `${baseURL}/auth/login`,
            resource: 'orgcentral-api',
            oidcConfig: {
                metadata: {
                    issuer: baseURL,
                },
            },
        }),
        nextCookies(),
    ],
    security: {
        token: {
            accessTokenExpiresIn: '15m',
            refreshTokenExpiresIn: '7d',
        },
    },
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
