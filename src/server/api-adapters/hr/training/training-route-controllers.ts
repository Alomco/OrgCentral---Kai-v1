import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';
import { completeTrainingController } from './complete-training';
import { deleteTrainingRecordController } from './delete-training-record';
import { enrollTrainingController } from './enroll-training';
import { getTrainingRecordController } from './get-training-record';
import { listTrainingRecordsController } from './list-training-records';
import { updateTrainingRecordController } from './update-training-record';
import type { CompleteTrainingResult } from '@/server/use-cases/hr/training/complete-training';
import type { DeleteTrainingRecordResult } from '@/server/use-cases/hr/training/delete-training-record';
import type { EnrollTrainingResult } from '@/server/use-cases/hr/training/enroll-training';
import type { GetTrainingRecordResult } from '@/server/use-cases/hr/training/get-training-record';
import type { ListTrainingRecordsResult } from '@/server/use-cases/hr/training/list-training-records';
import type { UpdateTrainingRecordResult } from '@/server/use-cases/hr/training/update-training-record';

const AUDIT_SOURCES = {
    list: 'api:hr:training:list',
    enroll: 'api:hr:training:enroll',
    get: 'api:hr:training:get',
    update: 'api:hr:training:update',
    delete: 'api:hr:training:delete',
    complete: 'api:hr:training:complete',
} as const;

export async function listTrainingRecordsRouteController(request: Request): Promise<ListTrainingRecordsResult> {
    return listTrainingRecordsController({
        headers: request.headers,
        input: buildListFilters(request),
        auditSource: AUDIT_SOURCES.list,
    });
}

export async function enrollTrainingRouteController(request: Request): Promise<EnrollTrainingResult> {
    const body: unknown = await readJson(request);

    return enrollTrainingController({
        headers: request.headers,
        input: body,
        auditSource: AUDIT_SOURCES.enroll,
    });
}

export async function getTrainingRecordRouteController(
    request: Request,
    recordId: string,
): Promise<GetTrainingRecordResult> {
    const id = requireRecordId(recordId);

    return getTrainingRecordController({
        headers: request.headers,
        recordId: id,
        auditSource: AUDIT_SOURCES.get,
    });
}

export async function updateTrainingRecordRouteController(
    request: Request,
    recordId: string,
): Promise<UpdateTrainingRecordResult> {
    const id = requireRecordId(recordId);
    const body: unknown = await readJson(request);

    return updateTrainingRecordController({
        headers: request.headers,
        recordId: id,
        input: body,
        auditSource: AUDIT_SOURCES.update,
    });
}

export async function deleteTrainingRecordRouteController(
    request: Request,
    recordId: string,
): Promise<DeleteTrainingRecordResult> {
    const id = requireRecordId(recordId);

    return deleteTrainingRecordController({
        headers: request.headers,
        recordId: id,
        auditSource: AUDIT_SOURCES.delete,
    });
}

export async function completeTrainingRouteController(
    request: Request,
    recordId: string,
): Promise<CompleteTrainingResult> {
    const id = requireRecordId(recordId);
    const body: unknown = await readJson(request);

    return completeTrainingController({
        headers: request.headers,
        recordId: id,
        input: body,
        auditSource: AUDIT_SOURCES.complete,
    });
}

function buildListFilters(request: Request): Record<string, string | undefined> {
    const url = new URL(request.url);
    return {
        status: url.searchParams.get('status') ?? undefined,
        trainingTitle: url.searchParams.get('trainingTitle') ?? undefined,
        startDate: url.searchParams.get('startDate') ?? undefined,
        endDate: url.searchParams.get('endDate') ?? undefined,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        userId: url.searchParams.get('userId') ?? undefined,
        expiryBefore: url.searchParams.get('expiryBefore') ?? undefined,
        expiryAfter: url.searchParams.get('expiryAfter') ?? undefined,
    };
}

function requireRecordId(recordId: string): string {
    const trimmed = recordId.trim();
    if (!trimmed) {
        throw new ValidationError('Training record id is required.');
    }
    return trimmed;
}
