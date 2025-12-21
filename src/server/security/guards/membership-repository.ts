import type { IGuardMembershipRepository } from '@/server/repositories/contracts/security/guard-membership-repository-contract';
import { PrismaGuardMembershipRepository } from '@/server/repositories/prisma/security/guard/prisma-guard-membership-repository';

const defaultGuardMembershipRepository: IGuardMembershipRepository = new PrismaGuardMembershipRepository();

let guardMembershipRepository: IGuardMembershipRepository = defaultGuardMembershipRepository;

/**
 * Test-only hook for swapping the guard membership repository.
 * Avoids mutable global state in production paths.
 */
export function __setGuardMembershipRepositoryForTests(repository: IGuardMembershipRepository): void {
    guardMembershipRepository = repository;
}

export function __resetGuardMembershipRepositoryForTests(): void {
    guardMembershipRepository = defaultGuardMembershipRepository;
}

export function getGuardMembershipRepository(): IGuardMembershipRepository {
    return guardMembershipRepository;
}
