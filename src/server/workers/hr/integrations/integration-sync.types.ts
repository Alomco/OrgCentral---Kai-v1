import { z } from 'zod';

import type {
    WorkerJobAuthorization,
    WorkerJobEnvelope,
    WorkerJobMetadata,
} from '@/server/workers/abstract-org-worker';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';

export const HR_INTEGRATION_SYNC_JOB_NAME = 'hr.integrations.sync';

export const INTEGRATION_PROVIDER_VALUES = ['google_calendar', 'm365_calendar', 'lms'] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDER_VALUES)[number];

export const jobAuthorizationSchema: z.ZodType<WorkerJobAuthorization> = z.object({
    userId: z.uuid(),
    requiredPermissions: z.record(z.string().min(1), z.array(z.string().min(1))).optional(),
    requiredAnyPermissions: z
        .array(z.record(z.string().min(1), z.array(z.string().min(1))))
        .optional(),
    expectedClassification: z.enum(DATA_CLASSIFICATION_LEVELS).optional(),
    expectedResidency: z.enum(DATA_RESIDENCY_ZONES).optional(),
    auditSource: z.string().min(3).default('worker:hr:integrations:sync'),
    correlationId: z.uuid().optional(),
}) as z.ZodType<WorkerJobAuthorization>;

export const jobMetadataSchema: z.ZodType<WorkerJobMetadata | undefined> = z
    .object({
        correlationId: z.uuid().optional(),
        cacheScopes: z.array(z.string()).optional(),
        attributes: z.record(z.string(), z.unknown()).optional(),
    })
    .partial()
    .optional();

export const integrationSyncPayloadSchema = z.object({
    provider: z.enum(INTEGRATION_PROVIDER_VALUES),
    trigger: z.enum(['manual', 'scheduled']).default('manual'),
    requestedByUserId: z.uuid(),
});

export type IntegrationSyncPayloadInput = z.input<typeof integrationSyncPayloadSchema>;
export type IntegrationSyncPayload = z.output<typeof integrationSyncPayloadSchema>;

export const integrationSyncEnvelopeSchema = z.object({
    orgId: z.uuid(),
    payload: integrationSyncPayloadSchema,
    authorization: jobAuthorizationSchema,
    metadata: jobMetadataSchema,
});

export type IntegrationSyncEnvelope = WorkerJobEnvelope<IntegrationSyncPayload>;
