import { defaultSecurityPolicies } from '@/server/security/policies';
import type { EmployeeProfileDTO, EmploymentContractDTO } from '@/server/types/hr/people';
import type {
  RedactedContractExport,
  RedactedProfileExport,
} from './people-sar-exporter.types';

type RedactionFields = ReadonlySet<string>;

const BASE_REDACTIONS = new Set<string>([
  'niNumber',
  'healthStatus',
  'healthData',
  'bankDetails',
  'diversityAttributes',
  'workPermit',
  'salaryDetails',
]);

function coerceDate(value: unknown): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isSalaryConfidential(profile: EmployeeProfileDTO): boolean {
  const metadata = (profile.metadata && typeof profile.metadata === 'object'
    ? profile.metadata
    : {}) as Record<string, unknown>;
  if (typeof metadata.salaryConfidential === 'boolean') {
    return metadata.salaryConfidential;
  }
  const salaryDetails = (profile.salaryDetails ?? {}) as Record<string, unknown>;
  if (typeof salaryDetails.confidential === 'boolean') {
    return salaryDetails.confidential;
  }
  if (typeof salaryDetails.isConfidential === 'boolean') {
    return salaryDetails.isConfidential;
  }
  return false;
}

function redactMetadataKeys(metadata: unknown, fields: RedactionFields): unknown {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return metadata;
  }
  const record = metadata as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !fields.has(key)),
  );
}

export function shouldOmitForErasure(record: {
  erasureCompletedAt?: Date | string | null;
}): boolean {
  return Boolean(record.erasureCompletedAt);
}

export function isRetentionExpired(
  retentionExpiresAt: Date | string | null | undefined,
  now: Date,
): boolean {
  if (!retentionExpiresAt) {
    return false;
  }
  const date = retentionExpiresAt instanceof Date ? retentionExpiresAt : new Date(retentionExpiresAt);
  return !Number.isNaN(date.getTime()) && date.getTime() <= now.getTime();
}

export function redactProfile(
  profile: EmployeeProfileDTO,
  extraFields?: string[],
): { redacted: RedactedProfileExport; redactedFields: string[] } {
  const redactionSet: RedactionFields = new Set([
    ...BASE_REDACTIONS,
    ...defaultSecurityPolicies.audit.redactSensitiveFields,
    ...(extraFields ?? []),
  ]);
  const redactedFields: string[] = [];
  const salaryConfidential = isSalaryConfidential(profile);
  const metadata = redactMetadataKeys(profile.metadata, redactionSet);

  const redacted: RedactedProfileExport = {
    resource: 'profile',
    id: profile.id,
    orgId: profile.orgId,
    userId: profile.userId,
    employeeNumber: profile.employeeNumber,
    employmentType: profile.employmentType,
    employmentStatus: profile.employmentStatus,
    startDate: coerceDate(profile.startDate),
    endDate: coerceDate(profile.endDate),
    departmentId: profile.departmentId ?? null,
    jobTitle: profile.jobTitle ?? null,
    costCenter: profile.costCenter ?? null,
    salaryAmount: salaryConfidential ? null : profile.salaryAmount ?? null,
    salaryCurrency: salaryConfidential ? null : profile.salaryCurrency ?? null,
    salaryFrequency: salaryConfidential ? null : profile.salaryFrequency ?? null,
    retentionPolicy: profile.retentionPolicy ?? null,
    retentionExpiresAt: coerceDate(profile.retentionExpiresAt),
    erasureRequestedAt: coerceDate(profile.erasureRequestedAt),
    erasureCompletedAt: coerceDate(profile.erasureCompletedAt),
    dataResidency: profile.dataResidency,
    dataClassification: profile.dataClassification,
    correlationId: profile.correlationId ?? null,
    auditSource: profile.auditSource ?? null,
  };

  redactionSet.forEach((field) => {
    if (field in profile || (metadata && field in (metadata as Record<string, unknown>))) {
      redactedFields.push(field);
    }
  });

  if (salaryConfidential) {
    redactedFields.push('salaryAmount', 'salaryCurrency', 'salaryFrequency');
  }

  return { redacted, redactedFields };
}

export function redactContract(
  contract: EmploymentContractDTO,
  extraFields?: string[],
): { redacted: RedactedContractExport; redactedFields: string[] } {
  const redactionSet: RedactionFields = new Set([
    ...BASE_REDACTIONS,
    ...defaultSecurityPolicies.audit.redactSensitiveFields,
    ...(extraFields ?? []),
  ]);

  const redacted: RedactedContractExport = {
    resource: 'contract',
    id: contract.id,
    orgId: contract.orgId,
    userId: contract.userId,
    contractType: contract.contractType,
    startDate: coerceDate(contract.startDate) ?? new Date().toISOString(),
    endDate: coerceDate(contract.endDate),
    jobTitle: contract.jobTitle,
    departmentId: contract.departmentId ?? null,
    location: contract.location ?? null,
    retentionPolicy: contract.retentionPolicy ?? null,
    retentionExpiresAt: coerceDate(contract.retentionExpiresAt),
    erasureRequestedAt: coerceDate(contract.erasureRequestedAt),
    erasureCompletedAt: coerceDate(contract.erasureCompletedAt),
    dataResidency: contract.dataResidency,
    dataClassification: contract.dataClassification,
    correlationId: contract.correlationId ?? null,
    auditSource: contract.auditSource ?? null,
  };

  const redactedFields: string[] = [];
  redactionSet.forEach((field) => {
    if (field in contract) {
      redactedFields.push(field);
    }
  });

  return { redacted, redactedFields };
}
