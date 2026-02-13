import { describe, expect, it } from 'vitest';

import { ValidationError } from '@/server/errors';
import type { AbacPolicy } from '@/server/security/abac-types';
import { assertAbacPoliciesUseKnownSelectors } from '@/server/use-cases/org/abac/abac-policy-selector-validator';

function createPolicy(overrides: Partial<AbacPolicy>): AbacPolicy {
  return {
    id: 'policy-1',
    effect: 'allow',
    actions: ['update'],
    resources: ['hr.people.profile'],
    ...overrides,
  };
}

describe('assertAbacPoliciesUseKnownSelectors', () => {
  it('rejects ABAC policies with unknown action selectors', async () => {
    await expect(
      assertAbacPoliciesUseKnownSelectors('org-1', [
        createPolicy({
          id: 'policy-unknown-action',
          actions: ['super-admin'],
        }),
      ]),
    ).rejects.toThrowError(ValidationError);

    await expect(
      assertAbacPoliciesUseKnownSelectors('org-1', [
        createPolicy({
          id: 'policy-unknown-action',
          actions: ['super-admin'],
        }),
      ]),
    ).rejects.toThrow('unknown action selector');
  });

  it('rejects ABAC policies with unknown resource selectors', async () => {
    await expect(
      assertAbacPoliciesUseKnownSelectors('org-1', [
        createPolicy({
          id: 'policy-unknown-resource',
          resources: ['hr.people.nonexistent'],
        }),
      ]),
    ).rejects.toThrowError(ValidationError);

    await expect(
      assertAbacPoliciesUseKnownSelectors('org-1', [
        createPolicy({
          id: 'policy-unknown-resource',
          resources: ['hr.people.nonexistent'],
        }),
      ]),
    ).rejects.toThrow('unknown resource selector');
  });
});

