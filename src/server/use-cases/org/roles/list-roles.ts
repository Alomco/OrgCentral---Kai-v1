import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Role } from '@/server/types/hr-types';

export interface ListRolesInput {
  authorization: RepositoryAuthorizationContext;
}

export interface ListRolesDependencies {
  roleRepository: IRoleRepository;
}

export async function listRoles(
  deps: ListRolesDependencies,
  input: ListRolesInput,
): Promise<Role[]> {
  return deps.roleRepository.getRolesByOrganization(input.authorization.orgId);
}
