import { TableCell, TableRow } from '@/components/ui/table';
import { HrDataTable, type HrDataTableColumn } from '../../_components/hr-data-table';
import { HrStatusBadge } from '../../_components/hr-status-badge';
import { formatHumanDate } from '../../_components/format-date';
import type { TeamTimeEntry } from '../team-entries';

export interface TeamTimeEntriesPanelProps {
    entries: TeamTimeEntry[];
}

const COLUMNS: readonly HrDataTableColumn[] = [
    { key: 'employee', label: 'Employee' },
    { key: 'date', label: 'Date' },
    { key: 'project', label: 'Project' },
    { key: 'hours', label: 'Hours', className: 'text-right' },
    { key: 'status', label: 'Status' },
] as const;

function formatDate(value: Date | null | undefined): string {
    if (!value) {
        return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'N/A';
    }
    return formatHumanDate(date);
}

function formatHours(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    if (Number.isNaN(value)) {
        return 'N/A';
    }
    return value.toFixed(1);
}

export function TeamTimeEntriesPanel({ entries }: TeamTimeEntriesPanelProps) {
    return (
        <HrDataTable
            title="Team time entries"
            description="Latest time entries from direct reports (last 30 days)."
            columns={COLUMNS}
            isEmpty={entries.length === 0}
            emptyMessage="No recent time entries from direct reports."
        >
            {entries.map((entry) => (
                <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.employeeName}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                    <TableCell className="min-w-0 max-w-[200px] truncate">
                        {entry.project ?? 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">{formatHours(entry.totalHours)}</TableCell>
                    <TableCell>
                        <HrStatusBadge status={entry.status} />
                    </TableCell>
                </TableRow>
            ))}
        </HrDataTable>
    );
}
