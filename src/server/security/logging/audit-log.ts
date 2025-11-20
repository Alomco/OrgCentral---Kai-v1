import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface AuditLogEntry {
    orgId: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    timestamp: Date;
    classification: DataClassificationLevel;
    residency: DataResidencyZone;
    auditSource?: string;
    auditBatchId?: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
    immutable?: boolean;
}

export interface AuditSink {
    write: (entry: AuditLogEntry) => Promise<void>;
}

export interface AuditLoggerOptions {
    sinks: AuditSink[];
    defaultClassification: DataClassificationLevel;
    defaultResidency: DataResidencyZone;
    defaultSource?: string;
}

export type AuditLogInput = Omit<AuditLogEntry, 'timestamp' | 'classification' | 'residency'> &
    Partial<Pick<AuditLogEntry, 'classification' | 'residency'>>;

export function createAuditLogger(options: AuditLoggerOptions) {
    async function log(entry: AuditLogInput): Promise<void> {
        const record: AuditLogEntry = {
            timestamp: new Date(),
            classification: entry.classification ?? options.defaultClassification,
            residency: entry.residency ?? options.defaultResidency,
            auditSource: entry.auditSource ?? options.defaultSource,
            ...entry,
        };
        await Promise.all(options.sinks.map((sink) => sink.write(record)));
    }

    return { log };
}
