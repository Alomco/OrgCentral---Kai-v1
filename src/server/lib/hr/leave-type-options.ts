import type { PrismaJsonValue } from '@/server/types/prisma';
import type { LeaveTypeOption } from '@/server/types/hr/leave-type-options';

type JsonRecord = Record<string, PrismaJsonValue>;

function isJsonRecord(value: PrismaJsonValue): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatLeaveTypeLabel(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractLeaveTypeFromRecord(record: JsonRecord, fallbackCode?: string): LeaveTypeOption | null {
    const codeCandidate = record.code ?? record.key ?? record.id ?? fallbackCode;
    if (typeof codeCandidate !== 'string' || codeCandidate.trim().length === 0) {
        return null;
    }
    const activeCandidate = record.isActive ?? record.active;
    if (typeof activeCandidate === 'boolean' && !activeCandidate) {
        return null;
    }
    const code = codeCandidate.trim();
    const nameCandidate = record.name ?? record.label ?? record.title;
    const name = typeof nameCandidate === 'string' && nameCandidate.trim().length > 0
        ? nameCandidate.trim()
        : formatLeaveTypeLabel(code);
    const descriptionCandidate = record.description;
    const description = typeof descriptionCandidate === 'string' && descriptionCandidate.trim().length > 0
        ? descriptionCandidate.trim()
        : undefined;
    return { code, name, description };
}

export function normalizeLeaveTypeOptions(value: PrismaJsonValue | undefined | null): LeaveTypeOption[] {
    if (!value) {
        return [];
    }

    const options: LeaveTypeOption[] = [];
    const seen = new Set<string>();

    const pushOption = (option: LeaveTypeOption | null) => {
        if (!option) {
            return;
        }
        const code = option.code.trim();
        if (code.length === 0 || seen.has(code)) {
            return;
        }
        seen.add(code);
        options.push({ ...option, code });
    };

    if (Array.isArray(value)) {
        value.forEach((entry) => {
            if (typeof entry === 'string') {
                const code = entry.trim();
                pushOption(code.length > 0 ? { code, name: formatLeaveTypeLabel(code) } : null);
                return;
            }
            if (entry && isJsonRecord(entry)) {
                pushOption(extractLeaveTypeFromRecord(entry));
            }
        });
        return options;
    }

    if (isJsonRecord(value)) {
        Object.entries(value).forEach(([key, entry]) => {
            if (typeof entry === 'string') {
                const code = entry.trim() || key.trim();
                pushOption(code.length > 0 ? { code, name: formatLeaveTypeLabel(code) } : null);
                return;
            }
            if (entry && isJsonRecord(entry)) {
                pushOption(extractLeaveTypeFromRecord(entry, key));
            }
        });
        return options;
    }

    return [];
}

export function buildLeaveTypeCodeSet(options: LeaveTypeOption[]): Set<string> {
    return new Set(options.map((option) => option.code.trim()).filter((code) => code.length > 0));
}
