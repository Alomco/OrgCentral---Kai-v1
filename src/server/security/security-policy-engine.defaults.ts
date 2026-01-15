import type { SecurityConfiguration } from './security-configuration-provider';
import type { SecurityPolicy } from './security-policy.types';

export function buildDefaultSecurityPolicies(
  orgId: string,
  config: SecurityConfiguration,
): SecurityPolicy[] {
  const policies: SecurityPolicy[] = [];
  const now = new Date();

  if (config.mfaRequiredForClassifiedData.length > 0) {
    policies.push({
      id: `mfa-required-${orgId}`,
      name: 'MFA Required for Classified Data',
      description: 'Requires MFA for accessing highly classified data',
      conditions: [
        {
          type: 'data_classification',
          operator: 'equals',
          value: config.mfaRequiredForClassifiedData[0],
        },
      ],
      actions: [
        {
          type: 'require_mfa',
          parameters: {},
        },
      ],
      priority: 10,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  policies.push({
    id: `pii-access-${orgId}`,
    name: 'PII Access Control',
    description: 'Controls access to personally identifiable information',
    conditions: [
      {
        type: 'data_classification',
        operator: 'equals',
        value: 'OFFICIAL_SENSITIVE',
      },
    ],
    actions: [
      {
        type: 'log_event',
        parameters: {},
      },
    ],
    priority: 20,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  });

  if (config.ipWhitelist.length > 0) {
    policies.push({
      id: `ip-whitelist-${orgId}`,
      name: 'IP Whitelist',
      description: 'Restricts access to whitelisted IP addresses',
      conditions: [
        {
          type: 'ip_address',
          operator: 'not_equals',
          value: config.ipWhitelist[0],
        },
      ],
      actions: [
        {
          type: 'deny',
          parameters: {},
        },
      ],
      priority: 5,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return policies;
}
