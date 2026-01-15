// Use-case: update HR module settings through settings repositories under tenant guard.

import { z } from 'zod';
import type { PrismaJsonObject, PrismaJsonValue } from '@/server/types/prisma';
import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRSettings } from '@/server/types/hr-ops-types';
import { AuthorizationError, ValidationError } from '@/server/errors';
import { toJsonValue } from '@/server/domain/absences/conversions';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';

const dataClassificationValues = [...DATA_CLASSIFICATION_LEVELS] as [
	(typeof DATA_CLASSIFICATION_LEVELS)[number],
	...(typeof DATA_CLASSIFICATION_LEVELS)[number][],
];

const residencyZoneValues = [...DATA_RESIDENCY_ZONES] as [
	(typeof DATA_RESIDENCY_ZONES)[number],
	...(typeof DATA_RESIDENCY_ZONES)[number][],
];

export const updateHRSettingsInputSchema = z
	.object({
		orgId: z.uuid(),
		leaveTypes: z.unknown().optional().nullable(),
		workingHours: z.unknown().optional().nullable(),
		approvalWorkflows: z.unknown().optional().nullable(),
		overtimePolicy: z.unknown().optional().nullable(),
		dataClassification: z.enum(dataClassificationValues).optional(),
		residencyTag: z.enum(residencyZoneValues).optional(),
		metadata: z.record(z.string(), z.unknown()).optional().nullable(),
	})
	.strict();

export type UpdateHRSettingsInput = z.infer<typeof updateHRSettingsInputSchema>;

export interface UpdateHrSettingsDependencies {
	hrSettingsRepository: IHRSettingsRepository;
}

export interface UpdateHrSettingsRequest {
	authorization: RepositoryAuthorizationContext;
	payload: UpdateHRSettingsInput;
}

export interface UpdateHrSettingsResult {
	settings: HRSettings;
}

type HrSettingsUpsertShape = Omit<HRSettings, 'orgId' | 'createdAt' | 'updatedAt'>;

function buildDefaultUpsertShape(): HrSettingsUpsertShape {
	return {
		leaveTypes: [],
		workingHours: {
			standardHoursPerDay: 8,
			standardDaysPerWeek: 5,
		} as PrismaJsonValue,
		approvalWorkflows: {},
		overtimePolicy: {
			enableOvertime: false,
		} as PrismaJsonValue,
		dataClassification: 'OFFICIAL',
		residencyTag: 'UK_ONLY',
		metadata: undefined,
	};
}

function toOptionalJsonValue(value: unknown): PrismaJsonValue | undefined {
	return toJsonValue(value);
}

function isPlainJsonObject(value: PrismaJsonValue | undefined): value is PrismaJsonObject {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeJsonObject(
	base: PrismaJsonValue | undefined,
	patch: PrismaJsonValue | undefined,
): PrismaJsonValue | undefined {
	if (patch === null) {
		return null;
	}

	if (!isPlainJsonObject(patch)) {
		return patch;
	}

	if (!isPlainJsonObject(base)) {
		return patch;
	}

	return { ...base, ...patch };
}

function applyPatch(
	base: HrSettingsUpsertShape,
	payload: UpdateHRSettingsInput,
): HrSettingsUpsertShape {
	const next: HrSettingsUpsertShape = { ...base };

	if (payload.leaveTypes !== undefined) {
		next.leaveTypes = toOptionalJsonValue(payload.leaveTypes);
	}

	if (payload.workingHours !== undefined) {
		next.workingHours = toOptionalJsonValue(payload.workingHours);
	}

	if (payload.approvalWorkflows !== undefined) {
		next.approvalWorkflows = toOptionalJsonValue(payload.approvalWorkflows);
	}

	if (payload.overtimePolicy !== undefined) {
		next.overtimePolicy = toOptionalJsonValue(payload.overtimePolicy);
	}

	if (payload.metadata !== undefined) {
		const patch = toOptionalJsonValue(payload.metadata);
		next.metadata = mergeJsonObject(base.metadata, patch);
	}

	if (payload.dataClassification) {
		next.dataClassification = payload.dataClassification;
	}

	if (payload.residencyTag) {
		next.residencyTag = payload.residencyTag;
	}

	return next;
}

export async function updateHrSettings(
	deps: UpdateHrSettingsDependencies,
	request: UpdateHrSettingsRequest,
): Promise<UpdateHrSettingsResult> {
	const parsed = updateHRSettingsInputSchema.safeParse(request.payload);
	if (!parsed.success) {
		throw new ValidationError('Invalid HR settings update payload.', {
			issues: parsed.error.issues,
		});
	}

	if (parsed.data.orgId !== request.authorization.orgId) {
		throw new AuthorizationError('Cross-tenant HR settings update denied.');
	}

	// Current persistence uses a single HRSettings table. If/when HRSettings and AbsenceSettings
	// are updated together, the repository boundary should be extended to support a transaction.
	const existing = await deps.hrSettingsRepository.getSettings(request.authorization.orgId);
	const base = existing
		? ({
			leaveTypes: existing.leaveTypes,
			workingHours: existing.workingHours,
			approvalWorkflows: existing.approvalWorkflows,
			overtimePolicy: existing.overtimePolicy,
			dataClassification: existing.dataClassification,
			residencyTag: existing.residencyTag,
			metadata: existing.metadata,
		} satisfies HrSettingsUpsertShape)
		: buildDefaultUpsertShape();

	const updates = applyPatch(base, parsed.data);
	const settings = await deps.hrSettingsRepository.upsertSettings(
		request.authorization.orgId,
		updates,
	);

	return { settings };
}
