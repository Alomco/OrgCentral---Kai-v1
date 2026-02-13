import { ValidationError } from '@/server/errors';
import type { IPermissionResourceRepository } from '@/server/repositories/contracts/org/permissions/permission-resource-repository-contract';
import { DEFAULT_BOOTSTRAP_POLICIES } from '@/server/security/abac-constants';
import type { AbacPolicy } from '@/server/security/abac-types';
import { ROLE_PERMISSION_STATEMENTS } from '@/server/security/role-permission-statements';

type PermissionResourceReader = Pick<IPermissionResourceRepository, 'listResources'>;

const EXTRA_ALLOWED_ACTIONS = [
  'org.abac.read',
  'org.abac.update',
  'org.organization.read',
  'org.organization.update',
  'org.role.list',
  'org.role.create',
  'org.role.update',
  'org.role.delete',
  'org.permissionResource.list',
  'org.permissionResource.get',
  'org.permissionResource.create',
  'org.permissionResource.update',
  'org.permissionResource.delete',
  'org.invitation.list',
  'org.invitation.create',
  'org.invitation.revoke',
  'org.invitation.resend',
  'notifications:list',
  'notifications:read',
  'notifications:compose',
  'notifications:delete',
  'auth.session.list',
  'auth.session.revoke',
  'notification.preference.update',
  'hr.onboarding.automation.apply',
] as const;

const EXTRA_ALLOWED_RESOURCES = [
  'org.abac.policy',
  'org.organization',
  'org.role',
  'org.permissionResource',
  'org.invitation',
  'org.membership',
  'org.leave-settings',
  'notification',
  'notification.preference',
  'auth.session',
  'platform.tenant',
  'appPermission',
  'enterpriseSettings',
  'security_event',
] as const;

export async function assertAbacPoliciesUseKnownSelectors(
  orgId: string,
  policies: readonly AbacPolicy[],
  permissionResourceRepository?: PermissionResourceReader,
): Promise<void> {
  const { allowedActions, allowedResources } = await buildAllowlist(orgId, permissionResourceRepository);

  for (const policy of policies) {
    for (const action of policy.actions) {
      if (!isAllowedSelector(action, allowedActions)) {
        throw new ValidationError(
          `ABAC policy "${policy.id}" contains unknown action selector "${action}".`,
        );
      }
    }

    for (const resource of policy.resources) {
      if (!isAllowedSelector(resource, allowedResources)) {
        throw new ValidationError(
          `ABAC policy "${policy.id}" contains unknown resource selector "${resource}".`,
        );
      }
    }
  }
}

async function buildAllowlist(
  orgId: string,
  permissionResourceRepository?: PermissionResourceReader,
): Promise<{ allowedActions: Set<string>; allowedResources: Set<string> }> {
  const allowedActions = new Set<string>();
  const allowedResources = new Set<string>();

  for (const [resource, actions] of Object.entries(ROLE_PERMISSION_STATEMENTS)) {
    allowedResources.add(resource);
    for (const action of actions) {
      allowedActions.add(action);
    }
  }

  for (const policy of DEFAULT_BOOTSTRAP_POLICIES) {
    for (const action of policy.actions) {
      allowedActions.add(action);
    }
    for (const resource of policy.resources) {
      allowedResources.add(resource);
    }
  }

  if (permissionResourceRepository) {
    const permissionResources = await permissionResourceRepository.listResources(orgId);
    for (const resource of permissionResources) {
      allowedResources.add(resource.resource);
      for (const action of resource.actions) {
        allowedActions.add(action);
      }
    }
  }

  for (const action of EXTRA_ALLOWED_ACTIONS) {
    allowedActions.add(action);
  }
  for (const resource of EXTRA_ALLOWED_RESOURCES) {
    allowedResources.add(resource);
  }

  return { allowedActions, allowedResources };
}

function isAllowedSelector(selector: string, allowlist: ReadonlySet<string>): boolean {
  if (selector === '*') {
    return true;
  }

  if (allowlist.has(selector)) {
    return true;
  }

  if (!selector.endsWith('*')) {
    return false;
  }

  const prefix = selector.slice(0, -1);
  if (!prefix) {
    return false;
  }

  for (const candidate of allowlist) {
    if (candidate.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}
