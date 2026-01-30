import type { PermissionResource } from '@/server/types/security-types';

import { extractLegacyKeys } from '../permission-resource-utils';

export type SortOption = 'resource' | 'updated' | 'actions';

export function buildActionOptions(resources: PermissionResource[]): string[] {
  const set = new Set<string>();
  for (const resource of resources) {
    if (!Array.isArray(resource.actions)) {
      continue;
    }
    for (const action of resource.actions) {
      const trimmed = action.trim();
      if (trimmed.length > 0) {
        set.add(trimmed);
      }
    }
  }
  return Array.from(set).sort((left, right) => left.localeCompare(right));
}

export function filterPermissionResources(
  resources: PermissionResource[],
  query: string,
  actionFilter: string[],
): PermissionResource[] {
  const search = query.trim().toLowerCase();
  const selectedActions = new Set(actionFilter);

  return resources.filter((resource) => {
    const actions = Array.isArray(resource.actions) ? resource.actions : [];
    const matchesActions =
      selectedActions.size === 0 ||
      Array.from(selectedActions).every((action) => actions.includes(action));

    if (!matchesActions) {
      return false;
    }

    if (!search) {
      return true;
    }

    const legacyKeys = extractLegacyKeys(resource);
    const haystack = [resource.resource, resource.description ?? '', ...actions, ...legacyKeys]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortPermissionResources(
  resources: PermissionResource[],
  sortBy: SortOption,
): PermissionResource[] {
  const sorted = [...resources];

  if (sortBy === 'updated') {
    sorted.sort((left, right) => {
      const leftTime = toTimestamp(left.updatedAt);
      const rightTime = toTimestamp(right.updatedAt);
      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }
      return left.resource.localeCompare(right.resource);
    });
    return sorted;
  }

  if (sortBy === 'actions') {
    sorted.sort((left, right) => {
      const leftCount = Array.isArray(left.actions) ? left.actions.length : 0;
      const rightCount = Array.isArray(right.actions) ? right.actions.length : 0;
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }
      return left.resource.localeCompare(right.resource);
    });
    return sorted;
  }

  sorted.sort((left, right) => left.resource.localeCompare(right.resource));
  return sorted;
}

function toTimestamp(value: Date | string): number {
  const dateValue = value instanceof Date ? value : new Date(value);
  const time = dateValue.getTime();
  return Number.isNaN(time) ? 0 : time;
}
