import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { mcp, organization } from 'better-auth/plugins';
import { prisma } from '@/server/lib/prisma';
import type { BetterAuthSessionPayload, BetterAuthUserPayload } from '@/server/lib/auth-sync';
import { syncBetterAuthSessionToPrisma, syncBetterAuthUserToPrisma } from '@/server/lib/auth-sync';
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
                loginPage: `${baseURL}/auth/login`,
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
    databaseHooks: {
        user: {
            create: {
                after: async (user: BetterAuthUserPayload) => {
                    await syncBetterAuthUserToPrisma(user);
                },
            },
            update: {
                after: async (user: BetterAuthUserPayload) => {
                    await syncBetterAuthUserToPrisma(user);
                },
            },
        },
        session: {
            create: {
                after: async (session: BetterAuthSessionPayload) => {
                    await syncBetterAuthSessionToPrisma(session);
                },
            },
            update: {
                after: async (session: BetterAuthSessionPayload) => {
                    await syncBetterAuthSessionToPrisma(session);
                },
            },
        },
    },
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
