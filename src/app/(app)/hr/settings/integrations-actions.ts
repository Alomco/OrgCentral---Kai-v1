'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { PrismaHRSettingsRepository } from '@/server/repositories/prisma/hr/settings';
import { updateHrSettings } from '@/server/use-cases/hr/settings/update-hr-settings';
import { invalidateHrSettingsCacheTag } from '@/server/use-cases/hr/settings/cache-helpers';
import { getIntegrationSyncQueueClient } from '@/server/workers/hr/integrations/integration-sync.queue';
import {
    INTEGRATION_PROVIDER_VALUES,
    type IntegrationProvider,
} from '@/server/workers/hr/integrations/integration-sync.types';

import { toFieldErrors } from '../_components/form-errors';
import { FIELD_CHECK_MESSAGE } from '../employees/action-helpers';
import type { HrIntegrationsFormState } from './integrations-form-state';
import {
    buildIntegrationCandidate,
    buildIntegrationStatus,
} from './integrations-actions-helpers';
import {
    buildHrIntegrationsStatus,
    hrIntegrationsFormSchema,
    normalizeIntegrationText,
    parseHrIntegrationsMetadata,
} from './integrations-schema';

const UPDATE_ERROR_MESSAGE = 'Unable to save integration settings.';
const SYNC_ERROR_MESSAGE = 'Unable to queue the integration sync.';

const providerSchema = z.enum(INTEGRATION_PROVIDER_VALUES);

const hrSettingsRepository = new PrismaHRSettingsRepository();

export async function updateHrIntegrationsAction(
    previous: HrIntegrationsFormState,
    formData: FormData,
): Promise<HrIntegrationsFormState> {
    const candidate = buildIntegrationCandidate(formData);
    const parsed = hrIntegrationsFormSchema.safeParse(candidate);

    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
            integrationStatus: previous.integrationStatus,
        };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { organization: ['update'] },
                auditSource: 'ui:hr:settings:integrations:update',
            },
        );
    } catch {
        return {
            status: 'error',
            message: 'Not authorized to update HR integrations.',
            values: previous.values,
            integrationStatus: previous.integrationStatus,
        };
    }

    try {
        const currentSettings = await hrSettingsRepository.getSettings(session.authorization.orgId);
        const currentIntegrations = parseHrIntegrationsMetadata(currentSettings?.metadata ?? null);

        const nextIntegrations = {
            googleCalendar: {
                ...currentIntegrations.googleCalendar,
                enabled: parsed.data.googleEnabled,
                calendarId: normalizeIntegrationText(parsed.data.googleCalendarId),
                serviceAccountEmail: normalizeIntegrationText(parsed.data.googleServiceAccountEmail),
                syncWindowDays: parsed.data.googleSyncWindowDays,
                status: buildIntegrationStatus(currentIntegrations.googleCalendar.status ?? null, parsed.data.googleEnabled),
            },
            m365Calendar: {
                ...currentIntegrations.m365Calendar,
                enabled: parsed.data.m365Enabled,
                tenantId: normalizeIntegrationText(parsed.data.m365TenantId),
                calendarId: normalizeIntegrationText(parsed.data.m365CalendarId),
                syncWindowDays: parsed.data.m365SyncWindowDays,
                status: buildIntegrationStatus(currentIntegrations.m365Calendar.status ?? null, parsed.data.m365Enabled),
            },
            lms: {
                ...currentIntegrations.lms,
                enabled: parsed.data.lmsEnabled,
                providerName: normalizeIntegrationText(parsed.data.lmsProviderName),
                baseUrl: normalizeIntegrationText(parsed.data.lmsBaseUrl),
                apiTokenLabel: normalizeIntegrationText(parsed.data.lmsApiTokenLabel),
                syncWindowDays: parsed.data.lmsSyncWindowDays,
                status: buildIntegrationStatus(currentIntegrations.lms.status ?? null, parsed.data.lmsEnabled),
            },
        };

        await updateHrSettings(
            { hrSettingsRepository },
            {
                authorization: session.authorization,
                payload: {
                    orgId: session.authorization.orgId,
                    metadata: {
                        integrations: nextIntegrations,
                    },
                },
            },
        );

        await invalidateHrSettingsCacheTag(session.authorization);
        revalidatePath('/hr/settings');

        return {
            status: 'success',
            message: 'Saved integration settings.',
            fieldErrors: undefined,
            values: parsed.data,
            integrationStatus: buildHrIntegrationsStatus(nextIntegrations),
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : UPDATE_ERROR_MESSAGE,
            fieldErrors: undefined,
            values: parsed.data,
            integrationStatus: previous.integrationStatus,
        };
    }
}

export async function triggerIntegrationSyncAction(
    provider: IntegrationProvider,
): Promise<{ status: 'success' | 'error'; message: string }> {
    const parsedProvider = providerSchema.safeParse(provider);
    if (!parsedProvider.success) {
        return { status: 'error', message: 'Select a valid integration provider.' };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { organization: ['update'] },
                auditSource: 'ui:hr:settings:integrations:sync',
            },
        );
    } catch {
        return { status: 'error', message: 'Not authorized to sync integrations.' };
    }

    try {
        const currentSettings = await hrSettingsRepository.getSettings(session.authorization.orgId);
        const currentIntegrations = parseHrIntegrationsMetadata(currentSettings?.metadata ?? null);
        const selectedIntegration =
            parsedProvider.data === 'google_calendar'
                ? currentIntegrations.googleCalendar
                : parsedProvider.data === 'm365_calendar'
                    ? currentIntegrations.m365Calendar
                    : currentIntegrations.lms;

        if (!selectedIntegration.enabled) {
            return { status: 'error', message: 'Enable the connector before queueing a sync.' };
        }

        const nowIso = new Date().toISOString();
        const queueClient = getIntegrationSyncQueueClient();

        await queueClient.enqueueIntegrationSyncJob({
            orgId: session.authorization.orgId,
            payload: {
                provider: parsedProvider.data,
                trigger: 'manual',
                requestedByUserId: session.authorization.userId,
            },
            authorization: {
                userId: session.authorization.userId,
                requiredPermissions: { organization: ['update'] },
                expectedClassification: session.authorization.dataClassification,
                expectedResidency: session.authorization.dataResidency,
                auditSource: 'worker:hr:integrations:sync',
            },
            metadata: {
                correlationId: session.authorization.correlationId,
            },
        });

        const nextIntegrations = {
            ...currentIntegrations,
            googleCalendar: { ...currentIntegrations.googleCalendar },
            m365Calendar: { ...currentIntegrations.m365Calendar },
            lms: { ...currentIntegrations.lms },
        };

        if (parsedProvider.data === 'google_calendar') {
            nextIntegrations.googleCalendar.lastSyncAt = nowIso;
            nextIntegrations.googleCalendar.status = 'queued';
        }
        if (parsedProvider.data === 'm365_calendar') {
            nextIntegrations.m365Calendar.lastSyncAt = nowIso;
            nextIntegrations.m365Calendar.status = 'queued';
        }
        if (parsedProvider.data === 'lms') {
            nextIntegrations.lms.lastSyncAt = nowIso;
            nextIntegrations.lms.status = 'queued';
        }

        await updateHrSettings(
            { hrSettingsRepository },
            {
                authorization: session.authorization,
                payload: {
                    orgId: session.authorization.orgId,
                    metadata: {
                        integrations: nextIntegrations,
                    },
                },
            },
        );

        await invalidateHrSettingsCacheTag(session.authorization);
        revalidatePath('/hr/settings');

        return { status: 'success', message: 'Sync queued.' };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : SYNC_ERROR_MESSAGE,
        };
    }
}
