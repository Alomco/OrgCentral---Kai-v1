import { EntityNotFoundError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { Membership } from '@/server/types/membership';
import { normalizeRoles } from '@/server/use-cases/shared';

export interface UpdateMembershipRolesInput {
  authorization: RepositoryAuthorizationContext;
  targetUserId: string;
  roles: string[];
}

export interface UpdateMembershipRolesResult {
  membership: Membership;
}

export interface UpdateMembershipRolesDependencies {
  userRepository: IUserRepository;
}

export async function updateMembershipRoles(
  deps: UpdateMembershipRolesDependencies,
  input: UpdateMembershipRolesInput,
): Promise<UpdateMembershipRolesResult> {
  const user = await deps.userRepository.getUser(input.authorization.orgId, input.targetUserId);
  if (!user) {
    throw new EntityNotFoundError('User', { userId: input.targetUserId });
  }

  let updatedMembership: Membership | undefined;
  const roles = normalizeRoles(input.roles);
  const nextMemberships = user.memberships.map((membership) => {
    if (membership.organizationId !== input.authorization.orgId) {
      return membership;
    }
    updatedMembership = { ...membership, roles };
    return updatedMembership;
  });

  if (!updatedMembership) {
    throw new EntityNotFoundError('Membership', {
      orgId: input.authorization.orgId,
      userId: input.targetUserId,
    });
  }

  await deps.userRepository.updateUserMemberships(
    input.authorization,
    input.targetUserId,
    nextMemberships,
  );

  return { membership: updatedMembership };
}
