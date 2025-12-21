import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';
import { LEAVE_ROUNDING_RULES } from '@/server/types/leave-types';
import type { LeaveYearStartDate } from '@/server/types/org/organization-settings';
import { normalizeLeaveYearStartDate } from '@/server/types/org/leave-year-start-date';

import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { getLeaveSettings as getLeaveSettingsUseCase } from '@/server/use-cases/org/organization/get-leave-settings';
import { updateLeaveSettings as updateLeaveSettingsUseCase } from '@/server/use-cases/org/organization/update-leave-settings';

const AUDIT_SOURCE = {
    get: 'api:org:leave-settings:get',
    update: 'api:org:leave-settings:update',
} as const;

const ORG_ID_REQUIRED_MESSAGE = 'Organization id is required.';

const leaveEntitlementsSchema = z.record(z.string().min(1).max(64), z.number().min(0).max(366));

function normalizeLeaveYearStartDateInput(value: string): LeaveYearStartDate {
    return normalizeLeaveYearStartDate(value);
}

function normalizeLeaveRoundingRuleInput(value: string) {
    if (value === 'nearest_half') {
        return 'half_day' as const;
    }
    if (value === 'round_up') {
        return 'full_day' as const;
    }

    return value as (typeof LEAVE_ROUNDING_RULES)[number];
}

const updateLeaveSettingsSchema = z
    .object({
        leaveEntitlements: leaveEntitlementsSchema.optional(),
        primaryLeaveType: z.string().trim().min(1).max(64).optional(),
        leaveYearStartDate: z
            .string()
            .trim()
            .refine(
                (value) => /^\d{2}-\d{2}$/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value),
                'leaveYearStartDate must be MM-DD or ISO date (YYYY-MM-DD).',
            )
            .transform((value) => normalizeLeaveYearStartDateInput(value))
            .optional(),
        leaveRoundingRule: z
            .union([z.enum(LEAVE_ROUNDING_RULES), z.literal('nearest_half'), z.literal('round_up')])
            .transform((value) => normalizeLeaveRoundingRuleInput(value))
            .optional(),
    })
    .strict();

export async function getLeaveSettingsController(request: Request, orgId: string) {
    const normalizedOrgId = orgId.trim();
    if (!normalizedOrgId) {
        throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: AUDIT_SOURCE.get,
            action: 'org.leaveSettings.read',
            resourceType: 'org.leave-settings',
            resourceAttributes: { orgId: normalizedOrgId },
        },
    );

    const repository = new PrismaOrganizationRepository();
    return getLeaveSettingsUseCase(
        { organizationRepository: repository },
        {
            authorization,
            orgId: normalizedOrgId,
        },
    );
}

export async function updateLeaveSettingsController(request: Request, orgId: string) {
    const normalizedOrgId = orgId.trim();
    if (!normalizedOrgId) {
        throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
    }

    const body = await readJson(request);
    const updates = updateLeaveSettingsSchema.parse(body);

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: AUDIT_SOURCE.update,
            action: 'org.leaveSettings.update',
            resourceType: 'org.leave-settings',
            resourceAttributes: {
                orgId: normalizedOrgId,
                keys: Object.keys(updates),
            },
        },
    );

    const repository = new PrismaOrganizationRepository();
    return updateLeaveSettingsUseCase(
        { organizationRepository: repository },
        {
            authorization,
            orgId: normalizedOrgId,
            updates,
        },
    );
}
