import { randomUUID } from 'node:crypto';

import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import { buildAuthorizationContext } from '@/server/use-cases/shared';

interface TenantServiceContextOptions {
    orgId: string;
    userId: string;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    auditSource: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}

interface SystemServiceContextOptions {
    auditSource: string;
    orgId?: string;
    userId?: string;
    dataResidency?: DataResidencyZone;
    dataClassification?: DataClassificationLevel;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}

export function buildTenantServiceContext(options: TenantServiceContextOptions): ServiceExecutionContext {
    const authorization = buildAuthorizationContext({
        orgId: options.orgId,
        userId: options.userId,
        dataResidency: options.dataResidency,
        dataClassification: options.dataClassification,
        auditSource: options.auditSource,
        correlationId: options.correlationId,
        tenantScope: {
            orgId: options.orgId,
            dataResidency: options.dataResidency,
            dataClassification: options.dataClassification,
            auditSource: options.auditSource,
        },
    });

    return {
        authorization,
        correlationId: authorization.correlationId,
        metadata: options.metadata,
    } satisfies ServiceExecutionContext;
}

export function buildSystemServiceContext(options: SystemServiceContextOptions): ServiceExecutionContext {
    const context = buildTenantServiceContext({
        orgId: options.orgId ?? 'system',
        userId: options.userId ?? 'system-service',
        dataResidency: options.dataResidency ?? 'UK_ONLY',
        dataClassification: options.dataClassification ?? 'OFFICIAL',
        auditSource: options.auditSource,
        correlationId: options.correlationId ?? randomUUID(),
        metadata: options.metadata,
    });

    return context;
}
