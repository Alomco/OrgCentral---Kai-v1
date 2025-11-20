import type { MembershipStatus } from '@prisma/client';

export interface UserFilters {
    email?: string;
    status?: MembershipStatus;
    orgId?: string;
}

export interface UserCreationData {
    email: string;
    displayName?: string;
    authProvider?: string;
}

export interface UserUpdateData {
    displayName?: string;
    lastLoginAt?: Date;
    failedLoginCount?: number;
    lockedUntil?: Date;
    lastPasswordChange?: Date;
}
