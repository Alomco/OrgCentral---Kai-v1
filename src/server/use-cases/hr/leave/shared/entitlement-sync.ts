import type { PrismaInputJsonObject, PrismaInputJsonValue } from '@/server/types/prisma';
import { normalizeLeaveType } from '@/server/use-cases/hr/leave/acc/sync-leave-accruals.entitlements';

export interface EntitlementSyncMarker {
    effectiveFrom: string;
    leaveTypes: string[];
    updatedAt: string;
}

export interface EntitlementSyncLeaveSettingsUpdate {
    entitlements?: Record<string, number>;
    primaryLeaveType?: string;
}

const isJsonObject = (
    value: PrismaInputJsonValue | PrismaInputJsonObject | null | undefined,
): value is PrismaInputJsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);

function normalizeLeaveTypes(values: string[]): string[] {
    const normalized = values.map((value) => normalizeLeaveType(value)).filter((value) => value.length > 0);
    return Array.from(new Set(normalized));
}

export function buildSettingsWithEntitlementSync(
    settings: PrismaInputJsonObject | null | undefined,
    marker: EntitlementSyncMarker,
    updates?: EntitlementSyncLeaveSettingsUpdate,
): PrismaInputJsonObject {
    const settingsRecord: PrismaInputJsonObject = isJsonObject(settings) ? { ...settings } : {};
    const leaveSettings = isJsonObject(settingsRecord.leave) ? { ...settingsRecord.leave } : {};

    const nextMarker: PrismaInputJsonObject = {
        effectiveFrom: marker.effectiveFrom,
        leaveTypes: normalizeLeaveTypes(marker.leaveTypes),
        updatedAt: marker.updatedAt,
    };

    return {
        ...settingsRecord,
        leave: {
            ...leaveSettings,
            entitlements: updates?.entitlements ?? leaveSettings.entitlements,
            primaryLeaveType: updates?.primaryLeaveType ?? leaveSettings.primaryLeaveType,
            entitlementSync: nextMarker,
        },
    };
}

export function readEntitlementSyncMarker(
    settings: PrismaInputJsonObject | null | undefined,
): EntitlementSyncMarker | null {
    if (!isJsonObject(settings)) {
        return null;
    }

    const leaveSettings = isJsonObject(settings.leave) ? settings.leave : null;
    if (!leaveSettings) {
        return null;
    }

    const raw = leaveSettings.entitlementSync;
    if (!isJsonObject(raw)) {
        return null;
    }

    const effectiveFrom = typeof raw.effectiveFrom === 'string' ? raw.effectiveFrom : '';
    const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : '';
    const leaveTypes = Array.isArray(raw.leaveTypes)
        ? raw.leaveTypes.filter((value) => typeof value === 'string')
        : [];

    if (!effectiveFrom || leaveTypes.length === 0) {
        return null;
    }

    return {
        effectiveFrom,
        updatedAt: updatedAt || effectiveFrom,
        leaveTypes: normalizeLeaveTypes(leaveTypes),
    };
}
