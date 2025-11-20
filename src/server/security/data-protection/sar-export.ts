export interface SarRequest {
    orgId: string;
    subjectId: string;
    windowStart?: Date;
    windowEnd?: Date;
    includeAudit?: boolean;
}

export interface SarRecord {
    key: string;
    payload: unknown;
    classification?: string;
    residency?: string;
}

export interface SarDataSource {
    key: string;
    fetch: (request: SarRequest) => Promise<SarRecord[]>;
    redact?: (record: SarRecord) => SarRecord;
}

export interface SarWriter {
    write: (records: SarRecord[]) => Promise<void>;
    finalize?: (records: SarRecord[]) => Promise<void>;
}

export interface SarExportResult {
    totalRecords: number;
    errors: string[];
}

export async function runSarExport(
    sources: SarDataSource[],
    request: SarRequest,
    writer: SarWriter,
): Promise<SarExportResult> {
    const collected: SarRecord[] = [];
    const errors: string[] = [];

    for (const source of sources) {
        try {
            const records = await source.fetch(request);
            for (const record of records) {
                const sanitized = source.redact ? source.redact(record) : record;
                collected.push({
                    ...sanitized,
                    classification: sanitized.classification ?? 'OFFICIAL',
                });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(`SAR source ${source.key} failed: ${message}`);
        }
    }

    await writer.write(collected);
    if (writer.finalize) {
        await writer.finalize(collected);
    }

    return {
        totalRecords: collected.length,
        errors,
    };
}
