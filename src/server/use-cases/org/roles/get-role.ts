import { EntityNotFoundError } from '@/server/errors';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Role } from '@/server/types/hr-types';

export interface GetRoleInput {
  authorization: RepositoryAuthorizationContext;
  roleId: string;
}

export interface GetRoleDependencies {
  roleRepository: IRoleRepository;
}

export async function getRole(deps: GetRoleDependencies, input: GetRoleInput): Promise<Role> {
  const role = await deps.roleRepository.getRole(input.authorization.orgId, input.roleId);
  if (!role) {
    throw new EntityNotFoundError('Role', { roleId: input.roleId });
  }
  return role;
}
