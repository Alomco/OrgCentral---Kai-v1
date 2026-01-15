import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export function isResidencyCompliant(
  current: DataResidencyZone,
  required: DataResidencyZone,
): boolean {
  if (current === required) {
    return true;
  }

  const complianceHierarchy: Record<DataResidencyZone, DataResidencyZone[]> = {
    UK_ONLY: ['UK_ONLY'],
    UK_AND_EEA: ['UK_AND_EEA', 'UK_ONLY'],
    GLOBAL_RESTRICTED: ['GLOBAL_RESTRICTED', 'UK_AND_EEA', 'UK_ONLY'],
  };

  return complianceHierarchy[current].includes(required);
}

export function isClassificationCompliant(
  current: DataClassificationLevel,
  required: DataClassificationLevel,
): boolean {
  if (current === required) {
    return true;
  }

  const classificationHierarchy: Record<DataClassificationLevel, number> = {
    OFFICIAL: 1,
    OFFICIAL_SENSITIVE: 2,
    SECRET: 3,
    TOP_SECRET: 4,
  };

  return classificationHierarchy[current] >= classificationHierarchy[required];
}

export function requiresMfaForClassification(
  classification: DataClassificationLevel,
): boolean {
  return classification === 'OFFICIAL_SENSITIVE' ||
    classification === 'SECRET' ||
    classification === 'TOP_SECRET';
}

export function isUKIPAddress(ipAddress: string): boolean {
  return ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.') ||
    ipAddress === '::1' ||
    ipAddress === '127.0.0.1' ||
    ipAddress.includes('.uk');
}

export function isUKOrEEAIPAddress(ipAddress: string): boolean {
  return isUKIPAddress(ipAddress) ||
    ipAddress.includes('.de') ||
    ipAddress.includes('.fr') ||
    ipAddress.includes('.nl') ||
    ipAddress.includes('.it') ||
    ipAddress.includes('.es') ||
    ipAddress.includes('.eu');
}
