import { z } from 'zod';
import {
  CONTRACT_TYPE_VALUES,
  EMPLOYMENT_STATUS_VALUES,
  EMPLOYMENT_TYPE_VALUES,
} from '@/server/types/hr/people';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';
import type { SarCsvOptions, SarExportFormat } from './people-sar-exporter.types';

const csvOptionsSchema = z.object({
  delimiter: z.string().length(1).optional(),
  quote: z.string().length(1).optional(),
}).partial() satisfies z.ZodType<SarCsvOptions>;

export const sarExportOptionsSchema = z.object({
  includeProfiles: z.boolean().optional().default(true),
  includeContracts: z.boolean().optional().default(true),
  format: z.enum(['jsonl', 'csv'] satisfies readonly SarExportFormat[]).optional().default('jsonl'),
  correlationId: z.uuid().optional(),
  auditSource: z.string().min(1).optional(),
  csvOptions: csvOptionsSchema.optional(),
});

export const redactedProfileExportSchema = z.object({
  resource: z.literal('profile'),
  id: z.uuid(),
  orgId: z.uuid(),
  userId: z.uuid(),
  employeeNumber: z.string(),
  employmentType: z.enum(EMPLOYMENT_TYPE_VALUES),
  employmentStatus: z.enum(EMPLOYMENT_STATUS_VALUES),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  departmentId: z.uuid().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  costCenter: z.string().nullable().optional(),
  salaryAmount: z.number().nullable().optional(),
  salaryCurrency: z.string().nullable().optional(),
  salaryFrequency: z.string().nullable().optional(),
  retentionPolicy: z.string().nullable().optional(),
  retentionExpiresAt: z.string().nullable().optional(),
  erasureRequestedAt: z.string().nullable().optional(),
  erasureCompletedAt: z.string().nullable().optional(),
  dataResidency: z.enum(DATA_RESIDENCY_ZONES).optional(),
  dataClassification: z.enum(DATA_CLASSIFICATION_LEVELS).optional(),
  correlationId: z.string().nullable().optional(),
  auditSource: z.string().nullable().optional(),
});

export const redactedContractExportSchema = z.object({
  resource: z.literal('contract'),
  id: z.uuid(),
  orgId: z.uuid(),
  userId: z.uuid(),
  contractType: z.enum(CONTRACT_TYPE_VALUES),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  jobTitle: z.string(),
  departmentId: z.uuid().nullable().optional(),
  location: z.string().nullable().optional(),
  retentionPolicy: z.string().nullable().optional(),
  retentionExpiresAt: z.string().nullable().optional(),
  erasureRequestedAt: z.string().nullable().optional(),
  erasureCompletedAt: z.string().nullable().optional(),
  dataResidency: z.enum(DATA_RESIDENCY_ZONES).optional(),
  dataClassification: z.enum(DATA_CLASSIFICATION_LEVELS).optional(),
  correlationId: z.string().nullable().optional(),
  auditSource: z.string().nullable().optional(),
});

export type SarExportOptionsSchema = typeof sarExportOptionsSchema;
