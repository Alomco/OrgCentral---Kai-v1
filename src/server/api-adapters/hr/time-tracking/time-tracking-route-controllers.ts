import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';
import {
    approveTimeEntryController,
} from './approve-time-entry';
import { createTimeEntryController } from './create-time-entry';
import { getTimeEntryController } from './get-time-entry';
import { listTimeEntriesController } from './list-time-entries';
import { updateTimeEntryController } from './update-time-entry';
import type { ListTimeEntriesResult } from '@/server/use-cases/hr/time-tracking/list-time-entries';
import type { CreateTimeEntryResult } from '@/server/use-cases/hr/time-tracking/create-time-entry';
import type { GetTimeEntryResult } from '@/server/use-cases/hr/time-tracking/get-time-entry';
import type { UpdateTimeEntryResult } from '@/server/use-cases/hr/time-tracking/update-time-entry';
import type { ApproveTimeEntryResult } from '@/server/use-cases/hr/time-tracking/approve-time-entry';

const AUDIT_SOURCES = {
    list: 'api:hr:time-tracking:list',
    create: 'api:hr:time-tracking:create',
    get: 'api:hr:time-tracking:get',
    update: 'api:hr:time-tracking:update',
    approve: 'api:hr:time-tracking:approve',
} as const;

export async function listTimeEntriesRouteController(request: Request): Promise<ListTimeEntriesResult> {
    return listTimeEntriesController({
        headers: request.headers,
        input: buildListFilters(request),
        auditSource: AUDIT_SOURCES.list,
    });
}

export async function createTimeEntryRouteController(request: Request): Promise<CreateTimeEntryResult> {
    const body: unknown = await readJson(request);

    return createTimeEntryController({
        headers: request.headers,
        input: body,
        auditSource: AUDIT_SOURCES.create,
    });
}

export async function getTimeEntryRouteController(
    request: Request,
    entryId: string,
): Promise<GetTimeEntryResult> {
    const id = requireEntryId(entryId);

    return getTimeEntryController({
        headers: request.headers,
        entryId: id,
        auditSource: AUDIT_SOURCES.get,
    });
}

export async function updateTimeEntryRouteController(
    request: Request,
    entryId: string,
): Promise<UpdateTimeEntryResult> {
    const id = requireEntryId(entryId);
    const body: unknown = await readJson(request);

    return updateTimeEntryController({
        headers: request.headers,
        entryId: id,
        input: body,
        auditSource: AUDIT_SOURCES.update,
    });
}

export async function approveTimeEntryRouteController(
    request: Request,
    entryId: string,
): Promise<ApproveTimeEntryResult> {
    const id = requireEntryId(entryId);
    const body: unknown = await readJson(request);

    return approveTimeEntryController({
        headers: request.headers,
        entryId: id,
        input: body,
        auditSource: AUDIT_SOURCES.approve,
    });
}

function buildListFilters(request: Request): Record<string, string | undefined> {
    const url = new URL(request.url);
    return {
        userId: url.searchParams.get('userId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        from: url.searchParams.get('from') ?? undefined,
        to: url.searchParams.get('to') ?? undefined,
    };
}

function requireEntryId(entryId: string): string {
    const trimmed = entryId.trim();
    if (!trimmed) {
        throw new ValidationError('Time entry id is required.');
    }
    return trimmed;
}
