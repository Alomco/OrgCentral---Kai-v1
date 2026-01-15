import { randomUUID } from 'node:crypto';
import type { PrismaClientInstance } from '@/server/types/prisma';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
    return UUID_REGEX.test(value);
}

export async function resolveCanonicalAuthUserId(
    prisma: PrismaClientInstance,
    authUserId: string,
    email: string,
): Promise<string> {
    if (isUuid(authUserId)) {
        return authUserId;
    }

    const existingTenantUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingTenantUser?.id) {
        return existingTenantUser.id;
    }

    return randomUUID();
}
