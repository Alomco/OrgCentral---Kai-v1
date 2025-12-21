import { randomUUID } from 'node:crypto';
import { stderr, stdout } from 'node:process';

import { prisma } from '../src/server/lib/prisma';

interface CliConfig {
    authUserId: string;
    platformOrgSlug: string;
    platformOrgName: string;
    roleName: string;
}

function resolveCliConfig(): CliConfig {
    const [, , userIdArgument] = process.argv;

    if (!userIdArgument || userIdArgument === '--help') {
        stderr.write('Usage: pnpm tsx scripts/promote-auth-user-to-global-admin.ts <authUserId>\n');
        process.exit(1);
    }

    const authUserId = userIdArgument.trim();
    if (authUserId.length < 8) {
        stderr.write('A valid Better Auth user id is required.\n');
        process.exit(1);
    }

    return {
        authUserId,
        platformOrgSlug: process.env.PLATFORM_ORG_SLUG ?? 'orgcentral-platform',
        platformOrgName: process.env.PLATFORM_ORG_NAME ?? 'OrgCentral Platform',
        roleName: process.env.GLOBAL_ADMIN_ROLE_NAME ?? 'owner',
    };
}

async function main(): Promise<void> {
    const config = resolveCliConfig();

    const user = await prisma.authUser.findUnique({
        where: { id: config.authUserId },
        select: { id: true, email: true, name: true },
    });

    if (!user) {
        stderr.write('Auth user was not found. Make sure you copied the User ID from /dashboard.\n');
        process.exit(1);
    }

    const organization = await prisma.authOrganization.upsert({
        where: { slug: config.platformOrgSlug },
        update: { name: config.platformOrgName },
        create: {
            id: randomUUID(),
            slug: config.platformOrgSlug,
            name: config.platformOrgName,
            metadata: JSON.stringify({
                seedSource: 'scripts/promote-auth-user-to-global-admin',
            }),
        },
        select: { id: true, slug: true, name: true },
    });

    const existingMember = await prisma.authOrgMember.findFirst({
        where: {
            organizationId: organization.id,
            userId: user.id,
        },
        select: { id: true },
    });

    const member = existingMember
        ? await prisma.authOrgMember.update({
            where: { id: existingMember.id },
            data: { role: config.roleName },
            select: { id: true, role: true },
        })
        : await prisma.authOrgMember.create({
            data: {
                id: randomUUID(),
                organizationId: organization.id,
                userId: user.id,
                role: config.roleName,
            },
            select: { id: true, role: true },
        });

    await prisma.authSession.updateMany({
        where: { userId: user.id },
        data: { activeOrganizationId: organization.id },
    });

    stdout.write('Global admin promotion complete (auth schema).\n');
    stdout.write(`  User ID: ${user.id}\n`);
    stdout.write(`  Org: ${organization.slug} (${organization.id})\n`);
    stdout.write(`  Role: ${member.role}\n`);
    stdout.write('If you have an existing session, refresh /dashboard to see active org.\n');

    // Avoid printing user.email by default.
}

main()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        stderr.write(`Promotion failed: ${message}\n`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
