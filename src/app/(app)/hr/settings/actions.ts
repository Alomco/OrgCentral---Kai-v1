'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { PrismaHRSettingsRepository } from '@/server/repositories/prisma/hr/settings';
import { updateHrSettings } from '@/server/use-cases/hr/settings/update-hr-settings';
import { invalidateHrSettingsCacheTag } from '@/server/use-cases/hr/settings/cache-helpers';
import { hrSettingsFormValuesSchema } from './schema';
import type { HrSettingsFormState } from './form-state';

function readFormString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
}

const leaveTypesListSchema = z.array(z.string().trim().min(1).max(40)).max(25);
const adminNotesSchema = z.string().trim().max(500);
const approvalWorkflowsJsonSchema = z.string().trim().max(8000);

function parseApprovalWorkflowsJson(raw: string): Prisma.JsonValue {
    const trimmed = raw.trim();
    if (!trimmed) {
        return {};
    }

    const value = JSON.parse(trimmed) as Prisma.JsonValue;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Approval workflows must be a JSON object.');
    }
    return value;
}

const hrSettingsRepository = new PrismaHRSettingsRepository();

export async function updateHrSettingsAction(
    previous: HrSettingsFormState,
    formData: FormData,
): Promise<HrSettingsFormState> {
    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();

        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { organization: ['update'] },
                auditSource: 'ui:hr-settings:update',
            },
        );
    } catch {
        return {
            status: 'error',
            message: 'Not authorized to update HR settings.',
            values: previous.values,
        };
    }

    const candidate = {
        standardHoursPerDay: formData.get('standardHoursPerDay'),
        standardDaysPerWeek: formData.get('standardDaysPerWeek'),
        enableOvertime: formData.get('enableOvertime') === 'on',
        leaveTypesCsv: readFormString(formData, 'leaveTypesCsv'),
        adminNotes: readFormString(formData, 'adminNotes'),
        approvalWorkflowsJson: readFormString(formData, 'approvalWorkflowsJson'),
    };

    const parsed = hrSettingsFormValuesSchema.safeParse(candidate);
    if (!parsed.success) {
        return { status: 'error', message: 'Invalid form data.', values: previous.values };
    }

    try {
        const leaveTypesCandidate = parsed.data.leaveTypesCsv
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0);

        const leaveTypesParsed = leaveTypesListSchema.safeParse(leaveTypesCandidate);
        if (!leaveTypesParsed.success) {
            return {
                status: 'error',
                message: 'Leave types must be comma-separated labels (max 25, 40 chars each).',
                values: previous.values,
            };
        }

        const adminNotesParsed = adminNotesSchema.safeParse(parsed.data.adminNotes);
        if (!adminNotesParsed.success) {
            return {
                status: 'error',
                message: 'Admin notes must be 500 characters or fewer.',
                values: previous.values,
            };
        }

        const leaveTypes = leaveTypesParsed.data;
        const adminNotes = adminNotesParsed.data;

        const approvalWorkflowsJsonParsed = approvalWorkflowsJsonSchema.safeParse(parsed.data.approvalWorkflowsJson);
        if (!approvalWorkflowsJsonParsed.success) {
            return {
                status: 'error',
                message: 'Approval workflows JSON must be 8000 characters or fewer.',
                values: previous.values,
            };
        }

        let approvalWorkflows: Prisma.JsonValue = {};
        try {
            approvalWorkflows = parseApprovalWorkflowsJson(approvalWorkflowsJsonParsed.data);
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Approval workflows must be valid JSON.',
                values: previous.values,
            };
        }

        await updateHrSettings(
            { hrSettingsRepository },
            {
                authorization: session.authorization,
                payload: {
                    orgId: session.authorization.orgId,
                    workingHours: {
                        standardHoursPerDay: parsed.data.standardHoursPerDay,
                        standardDaysPerWeek: parsed.data.standardDaysPerWeek,
                    },
                    overtimePolicy: {
                        enableOvertime: parsed.data.enableOvertime,
                    },
                    leaveTypes,
                    approvalWorkflows,
                    metadata: {
                        adminNotes: adminNotes.length > 0 ? adminNotes : null,
                    },
                },
            },
        );

        await invalidateHrSettingsCacheTag(session.authorization);

        return {
            status: 'success',
            message: 'Saved HR settings.',
            values: {
                ...parsed.data,
                leaveTypesCsv: leaveTypes.join(', '),
                adminNotes,
                approvalWorkflowsJson: approvalWorkflowsJsonParsed.data.trim(),
            },
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to save HR settings.',
            values: previous.values,
        };
    }
}
