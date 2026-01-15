import { randomUUID } from 'node:crypto';
import type { IGuardMembershipRepository } from '@/server/repositories/contracts/security/guard-membership-repository-contract';
import { PrismaGuardMembershipRepository } from '@/server/repositories/prisma/security/guard/prisma-guard-membership-repository';
import type { MembershipStatus } from '@/server/types/prisma';

const ACTIVE_MEMBERSHIP_STATUSES: readonly MembershipStatus[] = ['ACTIVE', 'INVITED'];

let membershipRepository: IGuardMembershipRepository = new PrismaGuardMembershipRepository();

export interface RequireActiveMembershipOptions {
    allowedStatuses?: readonly MembershipStatus[];
    repository?: IGuardMembershipRepository;
    correlationId?: string;
}

export interface ActiveMembershipCheckResult {
    orgId: string;
    userId: string;
    status?: MembershipStatus;
    correlationId: string;
}

export async function requireActiveMembership(
    orgId: string,
    userId: string,
    options?: RequireActiveMembershipOptions,
): Promise<ActiveMembershipCheckResult> {
    const repository = options?.repository ?? membershipRepository;
    const membership = await repository.findMembership(orgId, userId);

    if (!membership) {
        throw new Error('Membership was not found for the requested organization.');
    }

    const status = membership.status;
    const allowedStatuses = new Set<MembershipStatus>(options?.allowedStatuses ?? ACTIVE_MEMBERSHIP_STATUSES);

    if (!allowedStatuses.has(status)) {
        throw new Error('Membership is not active for this operation.');
    }

    return {
        orgId,
        userId,
        status,
        correlationId: options?.correlationId ?? randomUUID(),
    };
}

export function __setMembershipRepositoryForTests(repository: IGuardMembershipRepository): void {
    membershipRepository = repository;
}

export function __resetMembershipRepositoryForTests(): void {
    membershipRepository = new PrismaGuardMembershipRepository();
}

// Status is now sourced directly from membership.status.
