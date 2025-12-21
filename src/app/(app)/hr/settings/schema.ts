import { z } from 'zod';
import type { HRSettings } from '@/server/types/hr-ops-types';

export const hrWorkingHoursSchema = z
    .object({
        standardHoursPerDay: z.number().min(1).max(24).default(8),
        standardDaysPerWeek: z.number().min(1).max(7).default(5),
    })
    .strict();

export const hrOvertimePolicySchema = z
    .object({
        enableOvertime: z.boolean().default(false),
    })
    .strict();

const hrLeaveTypesSchema = z.array(z.string().trim().min(1)).max(25);

const hrSettingsMetadataSchema = z.looseObject({
    adminNotes: z.union([z.string().trim().max(500), z.null()]).optional(),
});

export const hrSettingsFormValuesSchema = z
    .object({
        standardHoursPerDay: z.coerce.number().min(1).max(24),
        standardDaysPerWeek: z.coerce.number().min(1).max(7),
        enableOvertime: z.boolean(),
        leaveTypesCsv: z.string().max(500),
        adminNotes: z.string().max(500),
        approvalWorkflowsJson: z.string().max(8000),
    })
    .strict();

export type HrSettingsFormValues = z.infer<typeof hrSettingsFormValuesSchema>;

export function deriveHrSettingsFormDefaults(settings: HRSettings): HrSettingsFormValues {
    const workingHoursParsed = hrWorkingHoursSchema.safeParse(settings.workingHours ?? undefined);
    const overtimeParsed = hrOvertimePolicySchema.safeParse(settings.overtimePolicy ?? undefined);
    const leaveTypesParsed = hrLeaveTypesSchema.safeParse(settings.leaveTypes ?? undefined);
    const metadataParsed = hrSettingsMetadataSchema.safeParse(settings.metadata ?? undefined);
    const approvalWorkflowsJson = stringifyJsonForTextarea(settings.approvalWorkflows);

    const workingHours = workingHoursParsed.success ? workingHoursParsed.data : hrWorkingHoursSchema.parse({});
    const overtimePolicy = overtimeParsed.success ? overtimeParsed.data : hrOvertimePolicySchema.parse({});

    const leaveTypesCsv = leaveTypesParsed.success ? leaveTypesParsed.data.join(', ') : '';
    const adminNotesRaw = metadataParsed.success ? metadataParsed.data.adminNotes : undefined;
    const adminNotes = typeof adminNotesRaw === 'string' ? adminNotesRaw : '';

    return {
        standardHoursPerDay: workingHours.standardHoursPerDay,
        standardDaysPerWeek: workingHours.standardDaysPerWeek,
        enableOvertime: overtimePolicy.enableOvertime,
        leaveTypesCsv,
        adminNotes,
        approvalWorkflowsJson,
    };
}

function stringifyJsonForTextarea(value: HRSettings['approvalWorkflows']): string {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return '';
    }

    try {
        const json = JSON.stringify(value, null, 2);
        return typeof json === 'string' ? json : '';
    } catch {
        return '';
    }
}
