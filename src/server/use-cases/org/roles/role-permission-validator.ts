import { ValidationError } from '@/server/errors';
import { ROLE_PERMISSION_STATEMENTS } from '@/server/security/role-permission-statements';
import type { IPermissionResourceRepository } from '@/server/repositories/contracts/org/permissions/permission-resource-repository-contract';
import type { PermissionResource } from '@/server/types/security-types';

type PermissionResourceReader = Pick<IPermissionResourceRepository, 'listResources'>;
type MutablePermissionMap = Record<string, string[]>;
export type ValidatedRolePermissions = Record<string, string[]>;

interface PermissionRegistry {
  readonly resourceActions: Map<string, Set<string>>;
  readonly aliases: Map<string, string>;
}

export async function validateRolePermissionsAgainstRegistry(
  orgId: string,
  permissions: Record<string, string[]>,
  permissionResourceRepository?: PermissionResourceReader,
): Promise<ValidatedRolePermissions> {
  const registry = await buildPermissionRegistry(orgId, permissionResourceRepository);
  const normalized: MutablePermissionMap = {};

  for (const [rawResource, rawActions] of Object.entries(permissions)) {
    const resource = rawResource.trim();
    if (!resource) {
      throw new ValidationError('Permission resource name cannot be empty.');
    }

    const canonicalResource = registry.aliases.get(resource) ?? resource;
    const allowedActions = registry.resourceActions.get(canonicalResource);
    if (!allowedActions) {
      throw new ValidationError(`Unknown permission resource "${resource}".`);
    }

    if (!Array.isArray(rawActions) || rawActions.length === 0) {
      throw new ValidationError(`Permission actions for "${canonicalResource}" are required.`);
    }

    const deduped = new Set<string>();
    for (const rawAction of rawActions) {
      const action = rawAction.trim();
      if (!action) {
        continue;
      }
      if (!allowedActions.has(action)) {
        throw new ValidationError(
          `Action "${action}" is not allowed for permission resource "${canonicalResource}".`,
        );
      }
      deduped.add(action);
    }

    if (!deduped.size) {
      throw new ValidationError(`Permission actions for "${canonicalResource}" are required.`);
    }

    const existing = normalized[canonicalResource] ?? [];
    normalized[canonicalResource] = Array.from(new Set([...existing, ...deduped])).sort();
  }

  return normalized;
}

async function buildPermissionRegistry(
  orgId: string,
  permissionResourceRepository?: PermissionResourceReader,
): Promise<PermissionRegistry> {
  const resourceActions = new Map<string, Set<string>>();
  const aliases = new Map<string, string>();

  for (const [resource, actions] of Object.entries(ROLE_PERMISSION_STATEMENTS)) {
    registerResource(resourceActions, aliases, resource, actions);
  }

  if (!permissionResourceRepository) {
    return { resourceActions, aliases };
  }

  const resources = await permissionResourceRepository.listResources(orgId);
  for (const resource of resources) {
    registerResource(resourceActions, aliases, resource.resource, resource.actions);
    for (const alias of extractLegacyAliases(resource)) {
      if (!aliases.has(alias)) {
        aliases.set(alias, resource.resource);
      }
    }
  }

  return { resourceActions, aliases };
}

function registerResource(
  resourceActions: Map<string, Set<string>>,
  aliases: Map<string, string>,
  resource: string,
  actions: readonly string[],
): void {
  const normalizedResource = resource.trim();
  if (!normalizedResource) {
    return;
  }

  const existing = resourceActions.get(normalizedResource) ?? new Set<string>();
  for (const action of actions) {
    const normalizedAction = action.trim();
    if (normalizedAction) {
      existing.add(normalizedAction);
    }
  }

  resourceActions.set(normalizedResource, existing);
  aliases.set(normalizedResource, normalizedResource);
}

function extractLegacyAliases(resource: PermissionResource): string[] {
  const metadata = resource.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return [];
  }

  const legacyKeys = (metadata as Record<string, unknown>).legacyKeys;
  if (!Array.isArray(legacyKeys)) {
    return [];
  }

  return legacyKeys
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
