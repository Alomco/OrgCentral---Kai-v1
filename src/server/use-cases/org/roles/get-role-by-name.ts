import { EntityNotFoundError } from '@/server/errors';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Role } from '@/server/types/hr-types';

export interface GetRoleByNameInput {
  authorization: RepositoryAuthorizationContext;
  name: string;
}

export interface GetRoleByNameDependencies {
  roleRepository: IRoleRepository;
}

export async function getRoleByName(
  deps: GetRoleByNameDependencies,
  input: GetRoleByNameInput,
): Promise<Role> {
  const normalized = input.name.trim();
  const role = await deps.roleRepository.getRoleByName(input.authorization.orgId, normalized);
  if (!role) {
    throw new EntityNotFoundError('Role', { name: normalized });
  }
  return role;
}
