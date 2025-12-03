import type { Readable } from 'node:stream';
import type { AuditEventPayload } from '@/server/logging/audit-logger';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfileDTO, EmploymentContractDTO } from '@/server/types/hr/people';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export type SarExportFormat = 'jsonl' | 'csv';

export interface SarCsvOptions {
  delimiter?: string;
  quote?: string;
}

export interface PeopleSarExportOptions {
  includeProfiles?: boolean;
  includeContracts?: boolean;
  format?: SarExportFormat;
  correlationId?: string;
  auditSource?: string;
  csvOptions?: SarCsvOptions;
}

export interface RedactedProfileExport {
  resource: 'profile';
  id: string;
  orgId: string;
  userId: string;
  employeeNumber: string;
  employmentType: EmployeeProfileDTO['employmentType'];
  employmentStatus: EmployeeProfileDTO['employmentStatus'];
  startDate?: string | null;
  endDate?: string | null;
  departmentId?: string | null;
  jobTitle?: string | null;
  costCenter?: string | null;
  salaryAmount?: number | null;
  salaryCurrency?: string | null;
  salaryFrequency?: EmployeeProfileDTO['salaryFrequency'];
  retentionPolicy?: string | null;
  retentionExpiresAt?: string | null;
  erasureRequestedAt?: string | null;
  erasureCompletedAt?: string | null;
  dataResidency?: DataResidencyZone;
  dataClassification?: DataClassificationLevel;
  correlationId?: string | null;
  auditSource?: string | null;
}

export interface RedactedContractExport {
  resource: 'contract';
  id: string;
  orgId: string;
  userId: string;
  contractType: EmploymentContractDTO['contractType'];
  startDate: string;
  endDate?: string | null;
  jobTitle: string;
  departmentId?: string | null;
  location?: string | null;
  retentionPolicy?: string | null;
  retentionExpiresAt?: string | null;
  erasureRequestedAt?: string | null;
  erasureCompletedAt?: string | null;
  dataResidency?: DataResidencyZone;
  dataClassification?: DataClassificationLevel;
  correlationId?: string | null;
  auditSource?: string | null;
}

export type RedactedExportRow = RedactedProfileExport | RedactedContractExport;

export interface PeopleSarExportResponse {
  stream: Readable;
  counts: {
    profiles: number;
    contracts: number;
    skipped: number;
  };
  format: SarExportFormat;
  correlationId?: string;
}

export type AuditLogger = (event: AuditEventPayload) => Promise<void>;

export interface PeopleSarExportDependencies {
  profileRepo: IEmployeeProfileRepository;
  contractRepo: IEmploymentContractRepository;
  auditLogger?: AuditLogger;
  now?: () => Date;
  redactionFields?: string[];
}

export interface SarExportPort {
  exportPeople(
    authorization: RepositoryAuthorizationContext,
    options?: PeopleSarExportOptions,
  ): Promise<PeopleSarExportResponse>;
}
