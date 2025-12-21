import type { RepositoryAuthorizationDefaults } from '@/server/repositories/security';

/**
 * Helper to create RepositoryAuthorizer defaults for HR People flows
 * Standardizes expected classification and residency for all people operations
 */

const DEFAULT_CLASSIFICATION = 'OFFICIAL';
const DEFAULT_RESIDENCY = 'UK_ONLY';

export function createHrPeopleAuthorizationDefaults(
  overrides?: Partial<RepositoryAuthorizationDefaults>
): RepositoryAuthorizationDefaults {
  return {
    expectedClassification: DEFAULT_CLASSIFICATION,
    expectedResidency: DEFAULT_RESIDENCY,
    auditSource: 'hr:people',
    requiredPermissions: { organization: ['read'] },
    ...overrides,
  };
}

export function createHrPeopleEditorRepositoryDefaults(
  overrides?: Partial<RepositoryAuthorizationDefaults>
): RepositoryAuthorizationDefaults {
  return createHrPeopleAuthorizationDefaults({
    auditSource: 'hr:people:edit',
    requiredPermissions: { employeeProfile: ['update'], employmentContract: ['update'] },
    ...overrides,
  });
}

export function createHrPeopleProfileRepositoryDefaults(
  overrides?: Partial<RepositoryAuthorizationDefaults>
): RepositoryAuthorizationDefaults {
  return createHrPeopleAuthorizationDefaults({
    auditSource: 'hr:people:profiles',
    ...overrides,
  });
}

export function createHrPeopleContractRepositoryDefaults(
  overrides?: Partial<RepositoryAuthorizationDefaults>
): RepositoryAuthorizationDefaults {
  return createHrPeopleAuthorizationDefaults({
    auditSource: 'hr:people:contracts',
    ...overrides,
  });
}
