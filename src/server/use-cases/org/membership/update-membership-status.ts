import type { MembershipStatus } from '@prisma/client';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IMembershipRepository } from '@/server/repositories/contracts/org/membership/membership-repository.types';

export interface UpdateMembershipStatusInput {
  authorization: RepositoryAuthorizationContext;
  targetUserId: string;
  status: MembershipStatus;
}

export interface UpdateMembershipStatusDependencies {
  membershipRepository: IMembershipRepository;
}

export interface UpdateMembershipStatusResult {
  success: true;
}

export async function updateMembershipStatus(
  deps: UpdateMembershipStatusDependencies,
  input: UpdateMembershipStatusInput,
): Promise<UpdateMembershipStatusResult> {
  await deps.membershipRepository.updateMembershipStatus(input.authorization, input.targetUserId, input.status);
  return { success: true };
}
