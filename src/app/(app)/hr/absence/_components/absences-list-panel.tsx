import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getAbsencesForUi } from '@/server/use-cases/hr/absences/get-absences.cached';
import { listAbsenceTypeConfigsForUi } from '@/server/use-cases/hr/absences/list-absence-type-configs.cached';
import { coerceAbsenceMetadata } from '@/server/domain/absences/metadata';

import { HrDataTable, type HrDataTableColumn } from '../../_components/hr-data-table';
import { AbsenceRows } from './absence-rows';
import type { AbsenceRowData, AbsenceTypeLabelMap } from './absence-row';

export interface AbsencesPanelProps {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
    includeClosed?: boolean;
    title?: string;
    description?: string;
    emptyMessage?: string;
}

const COLUMNS: readonly HrDataTableColumn[] = [
    { key: 'type', label: '📋 Type' },
    { key: 'dates', label: '📅 Dates' },
    { key: 'duration', label: '⏱️ Duration', className: 'text-right' },
    { key: 'status', label: '🏷️ Status' },
    { key: 'reported', label: '📝 Reported' },
    { key: 'actions', label: '', className: 'w-12' },
] as const;

const HISTORY_COLUMNS: readonly HrDataTableColumn[] = [
    { key: 'type', label: '📋 Type' },
    { key: 'dates', label: '📅 Dates' },
    { key: 'duration', label: '⏱️ Duration', className: 'text-right' },
    { key: 'status', label: '🏷️ Status' },
    { key: 'reported', label: '📝 Reported' },
    { key: 'notes', label: '🗒️ Notes' },
    { key: 'actions', label: '', className: 'w-12' },
] as const;

function toNumber(value: number | { toNumber?: () => number } | null | undefined): number {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === 'object' && typeof value.toNumber === 'function') {
        return value.toNumber();
    }
    return Number(value);
}

function resolveLifecycleNotes(input: {
    metadata: AbsenceRowData['metadata'];
    returnToWork: AbsenceRowData['returnToWork'];
}): string | null {
    const notes: string[] = [];
    const cancellation = input.metadata.cancellation;
    if (cancellation?.reason) {
        notes.push(`Cancelled: ${cancellation.reason}`);
    }

    const returnNotes = input.returnToWork?.comments?.trim();
    if (returnNotes) {
        notes.push(`Return to work: ${returnNotes}`);
    }

    const acknowledgements = Array.isArray(input.metadata.acknowledgements)
        ? input.metadata.acknowledgements
        : [];
    const latestAck = acknowledgements
        .filter((entry) => entry.note && entry.note.trim().length > 0)
        .at(-1);
    if (latestAck?.note) {
        notes.push(`Acknowledged: ${latestAck.note.trim()}`);
    }

    if (notes.length === 0) {
        return null;
    }
    return notes.join(' • ');
}

function isHistoryStatus(status: AbsenceRowData['status']): boolean {
    return status === 'CLOSED' || status === 'CANCELLED' || status === 'REJECTED';
}

/** Server component: fetches absences and renders the interactive list panel. */
export async function AbsenceListPanel({
    authorization,
    userId,
    includeClosed = false,
    title = '📊 Recent Absences',
    description = 'Unplanned absences and leave reports',
    emptyMessage = '✨ No absences recorded yet — looking good!',
}: AbsencesPanelProps) {
    const result = await getAbsencesForUi({
        authorization,
        userId,
        includeClosed,
    });

    const { types } = await listAbsenceTypeConfigsForUi({ authorization });
    const typeLabels: AbsenceTypeLabelMap = Object.fromEntries(
        types.map((type) => {
            const emoji = (() => {
                if (!type.metadata || typeof type.metadata !== 'object' || Array.isArray(type.metadata)) {
                    return undefined;
                }
                const value = (type.metadata as Record<string, unknown>).emoji;
                return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
            })();
            return [type.id, { label: type.label, emoji }];
        }),
    );

    const absences: AbsenceRowData[] = result.absences.map((absence) => {
        const metadata = coerceAbsenceMetadata(absence.metadata);
        const returnToWork = absence.returnToWork ?? null;
        return {
            id: absence.id,
            typeId: absence.typeId,
            startDate: absence.startDate,
            endDate: absence.endDate,
            hours: toNumber(absence.hours),
            reason: absence.reason ?? null,
            status: absence.status,
            createdAt: absence.createdAt,
            attachments: absence.attachments ?? [],
            returnToWork,
            metadata,
            lifecycleNotes: resolveLifecycleNotes({ metadata, returnToWork }),
        };
    });

    if (!includeClosed) {
        return (
            <HrDataTable
                title={title}
                description={description}
                columns={COLUMNS}
                isEmpty={absences.length === 0}
                emptyMessage={emptyMessage}
            >
                <AbsenceRows
                    absences={absences}
                    authorization={authorization}
                    typeLabels={typeLabels}
                />
            </HrDataTable>
        );
    }

    const ongoing = absences.filter((absence) => !isHistoryStatus(absence.status));
    const history = absences.filter((absence) => isHistoryStatus(absence.status));

    return (
        <div className="space-y-6">
            <HrDataTable
                title="🟢 Ongoing absences"
                description="Active absences awaiting completion or return-to-work."
                columns={COLUMNS}
                isEmpty={ongoing.length === 0}
                emptyMessage="No ongoing absences right now."
            >
                <AbsenceRows
                    absences={ongoing}
                    authorization={authorization}
                    typeLabels={typeLabels}
                />
            </HrDataTable>

            <HrDataTable
                title={title}
                description={description}
                columns={HISTORY_COLUMNS}
                isEmpty={history.length === 0}
                emptyMessage={emptyMessage}
            >
                <AbsenceRows
                    absences={history}
                    authorization={authorization}
                    typeLabels={typeLabels}
                    showNotes
                />
            </HrDataTable>
        </div>
    );
}
