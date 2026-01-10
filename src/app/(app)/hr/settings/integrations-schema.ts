import { z } from 'zod';

import type { HRSettings } from '@/server/types/hr-ops-types';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

const googleCalendarMetadataSchema = z.object({
    enabled: z.boolean().optional(),
    calendarId: optionalText(120),
    serviceAccountEmail: optionalText(200),
    syncWindowDays: z.number().int().min(1).max(90).optional(),
    lastSyncAt: optionalText(60),
    status: optionalText(40),
}).partial();

const m365CalendarMetadataSchema = z.object({
    enabled: z.boolean().optional(),
    tenantId: optionalText(200),
    calendarId: optionalText(120),
    syncWindowDays: z.number().int().min(1).max(90).optional(),
    lastSyncAt: optionalText(60),
    status: optionalText(40),
}).partial();

const lmsMetadataSchema = z.object({
    enabled: z.boolean().optional(),
    providerName: optionalText(120),
    baseUrl: optionalText(200),
    apiTokenLabel: optionalText(120),
    syncWindowDays: z.number().int().min(1).max(180).optional(),
    lastSyncAt: optionalText(60),
    status: optionalText(40),
}).partial();

const integrationsMetadataSchema = z.object({
    googleCalendar: googleCalendarMetadataSchema.optional(),
    m365Calendar: m365CalendarMetadataSchema.optional(),
    lms: lmsMetadataSchema.optional(),
}).partial();

export interface HrCalendarIntegrationSettings {
    enabled: boolean;
    calendarId: string | null;
    serviceAccountEmail?: string | null;
    tenantId?: string | null;
    syncWindowDays: number;
    lastSyncAt: string | null;
    status: string | null;
}

export interface HrLmsIntegrationSettings {
    enabled: boolean;
    providerName: string | null;
    baseUrl: string | null;
    apiTokenLabel: string | null;
    syncWindowDays: number;
    lastSyncAt: string | null;
    status: string | null;
}

export interface HrIntegrationsMetadata {
    googleCalendar: HrCalendarIntegrationSettings;
    m365Calendar: HrCalendarIntegrationSettings;
    lms: HrLmsIntegrationSettings;
}

export interface HrIntegrationStatus {
    enabled: boolean;
    status: string | null;
    lastSyncAt: string | null;
}

export interface HrIntegrationsStatus {
    googleCalendar: HrIntegrationStatus;
    m365Calendar: HrIntegrationStatus;
    lms: HrIntegrationStatus;
}

export const hrIntegrationsFormSchema = z.object({
    googleEnabled: z.boolean(),
    googleCalendarId: z.string().trim().max(120),
    googleServiceAccountEmail: z.string().trim().max(200),
    googleSyncWindowDays: z.coerce.number().int().min(1).max(90),
    m365Enabled: z.boolean(),
    m365TenantId: z.string().trim().max(200),
    m365CalendarId: z.string().trim().max(120),
    m365SyncWindowDays: z.coerce.number().int().min(1).max(90),
    lmsEnabled: z.boolean(),
    lmsProviderName: z.string().trim().max(120),
    lmsBaseUrl: z.string().trim().max(200),
    lmsApiTokenLabel: z.string().trim().max(120),
    lmsSyncWindowDays: z.coerce.number().int().min(1).max(180),
}).strict();

export type HrIntegrationsFormValues = z.infer<typeof hrIntegrationsFormSchema>;

export interface HrIntegrationsDefaults {
    values: HrIntegrationsFormValues;
    status: HrIntegrationsStatus;
}

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function resolveCalendarDefaults(
    source: Partial<HrCalendarIntegrationSettings> | undefined,
    options: { serviceAccountEmail?: boolean; tenantId?: boolean },
): HrCalendarIntegrationSettings {
    return {
        enabled: source?.enabled ?? false,
        calendarId: normalizeText(source?.calendarId ?? null),
        serviceAccountEmail: options.serviceAccountEmail ? normalizeText(source?.serviceAccountEmail ?? null) : undefined,
        tenantId: options.tenantId ? normalizeText(source?.tenantId ?? null) : undefined,
        syncWindowDays: source?.syncWindowDays ?? 30,
        lastSyncAt: normalizeText(source?.lastSyncAt ?? null),
        status: normalizeText(source?.status ?? null),
    };
}

function resolveLmsDefaults(source: Partial<HrLmsIntegrationSettings> | undefined): HrLmsIntegrationSettings {
    return {
        enabled: source?.enabled ?? false,
        providerName: normalizeText(source?.providerName ?? null),
        baseUrl: normalizeText(source?.baseUrl ?? null),
        apiTokenLabel: normalizeText(source?.apiTokenLabel ?? null),
        syncWindowDays: source?.syncWindowDays ?? 30,
        lastSyncAt: normalizeText(source?.lastSyncAt ?? null),
        status: normalizeText(source?.status ?? null),
    };
}

export function parseHrIntegrationsMetadata(
    metadata: HRSettings['metadata'],
): HrIntegrationsMetadata {
    const raw = metadata && typeof metadata === 'object'
        ? (metadata as Record<string, unknown>).integrations
        : undefined;
    const parsed = integrationsMetadataSchema.safeParse(raw);
    const value = parsed.success ? parsed.data : {};

    return {
        googleCalendar: resolveCalendarDefaults(value.googleCalendar, { serviceAccountEmail: true }),
        m365Calendar: resolveCalendarDefaults(value.m365Calendar, { tenantId: true }),
        lms: resolveLmsDefaults(value.lms),
    };
}

export function deriveHrIntegrationsFormDefaults(settings: HRSettings): HrIntegrationsDefaults {
    const integrations = parseHrIntegrationsMetadata(settings.metadata ?? null);

    return {
        values: {
            googleEnabled: integrations.googleCalendar.enabled,
            googleCalendarId: integrations.googleCalendar.calendarId ?? '',
            googleServiceAccountEmail: integrations.googleCalendar.serviceAccountEmail ?? '',
            googleSyncWindowDays: integrations.googleCalendar.syncWindowDays,
            m365Enabled: integrations.m365Calendar.enabled,
            m365TenantId: integrations.m365Calendar.tenantId ?? '',
            m365CalendarId: integrations.m365Calendar.calendarId ?? '',
            m365SyncWindowDays: integrations.m365Calendar.syncWindowDays,
            lmsEnabled: integrations.lms.enabled,
            lmsProviderName: integrations.lms.providerName ?? '',
            lmsBaseUrl: integrations.lms.baseUrl ?? '',
            lmsApiTokenLabel: integrations.lms.apiTokenLabel ?? '',
            lmsSyncWindowDays: integrations.lms.syncWindowDays,
        },
        status: {
            googleCalendar: {
                enabled: integrations.googleCalendar.enabled,
                status: integrations.googleCalendar.status ?? null,
                lastSyncAt: integrations.googleCalendar.lastSyncAt ?? null,
            },
            m365Calendar: {
                enabled: integrations.m365Calendar.enabled,
                status: integrations.m365Calendar.status ?? null,
                lastSyncAt: integrations.m365Calendar.lastSyncAt ?? null,
            },
            lms: {
                enabled: integrations.lms.enabled,
                status: integrations.lms.status ?? null,
                lastSyncAt: integrations.lms.lastSyncAt ?? null,
            },
        },
    };
}

export function buildHrIntegrationsStatus(
    integrations: HrIntegrationsMetadata,
): HrIntegrationsStatus {
    return {
        googleCalendar: {
            enabled: integrations.googleCalendar.enabled,
            status: integrations.googleCalendar.status ?? null,
            lastSyncAt: integrations.googleCalendar.lastSyncAt ?? null,
        },
        m365Calendar: {
            enabled: integrations.m365Calendar.enabled,
            status: integrations.m365Calendar.status ?? null,
            lastSyncAt: integrations.m365Calendar.lastSyncAt ?? null,
        },
        lms: {
            enabled: integrations.lms.enabled,
            status: integrations.lms.status ?? null,
            lastSyncAt: integrations.lms.lastSyncAt ?? null,
        },
    };
}

export function normalizeIntegrationText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
