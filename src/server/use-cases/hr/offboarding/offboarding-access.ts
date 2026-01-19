import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IUserSessionRepository } from '@/server/repositories/contracts/auth/sessions/user-session-repository-contract';
import type { MembershipServiceContract } from '@/server/services/org/membership/membership-service.provider';

export interface OffboardingAccessInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
    userSessionRepository: IUserSessionRepository;
    membershipService?: MembershipServiceContract;
    attempts?: number;
}

export interface OffboardingAccessResult {
    revokedSessions: boolean;
    membershipSuspended: boolean;
}

export async function revokeOffboardingAccess(input: OffboardingAccessInput): Promise<OffboardingAccessResult> {
    const attempts = input.attempts ?? 3;
    const revokedSessions = await retry(async () => {
        await input.userSessionRepository.invalidateUserSessionsByUser(
            input.authorization.orgId,
            input.userId,
        );
    }, attempts);

    let membershipSuspended = false;
    if (input.membershipService) {
        membershipSuspended = await retry(async () => {
            await input.membershipService?.suspendMembership({
                authorization: input.authorization,
                targetUserId: input.userId,
            });
        }, attempts);
    }

    return { revokedSessions, membershipSuspended };
}

async function retry(task: () => Promise<void>, attempts: number): Promise<boolean> {
    let attempt = 0;
    while (attempt < attempts) {
        try {
            attempt += 1;
            await task();
            return true;
        } catch (error) {
            if (attempt >= attempts) {
                throw error;
            }
        }
    }
    return false;
}
