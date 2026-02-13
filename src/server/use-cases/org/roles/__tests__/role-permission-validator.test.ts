import { describe, expect, it } from 'vitest';

import { ValidationError } from '@/server/errors';
import { validateRolePermissionsAgainstRegistry } from '@/server/use-cases/org/roles/role-permission-validator';

describe('validateRolePermissionsAgainstRegistry', () => {
  it('rejects unknown permission resources', async () => {
    await expect(
      validateRolePermissionsAgainstRegistry('org-1', {
        'hr.people.unknown': ['read'],
      }),
    ).rejects.toThrowError(ValidationError);

    await expect(
      validateRolePermissionsAgainstRegistry('org-1', {
        'hr.people.unknown': ['read'],
      }),
    ).rejects.toThrow('Unknown permission resource');
  });

  it('rejects unknown actions for known resources', async () => {
    await expect(
      validateRolePermissionsAgainstRegistry('org-1', {
        'hr.people.profile': ['super-admin'],
      }),
    ).rejects.toThrowError(ValidationError);

    await expect(
      validateRolePermissionsAgainstRegistry('org-1', {
        'hr.people.profile': ['super-admin'],
      }),
    ).rejects.toThrow('is not allowed for permission resource');
  });
});

