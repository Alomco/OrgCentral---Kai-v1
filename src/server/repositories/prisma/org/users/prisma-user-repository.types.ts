import type { MembershipStatus } from '@/server/types/prisma';

export interface UserFilters {
    email?: string;
    status?: MembershipStatus;
    orgId?: string;
}

export interface UserUpdateData {
    displayName?: string;
    lastLoginAt?: Date;
    failedLoginCount?: number;
    lockedUntil?: Date;
    lastPasswordChange?: Date;
}
