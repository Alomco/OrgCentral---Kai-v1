// Use-case: fetch HR module settings via HR settings repositories under tenant guard.

import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRSettings } from '@/server/types/hr-ops-types';
import { AuthorizationError } from '@/server/errors';

export interface GetHrSettingsDependencies {
	hrSettingsRepository: IHRSettingsRepository;
}

export interface GetHrSettingsInput {
	authorization: RepositoryAuthorizationContext;
	orgId: string;
}

export interface GetHrSettingsResult {
	settings: HRSettings;
}

function buildDefaultHrSettings(orgId: string): HRSettings {
	const now = new Date();

	return {
		orgId,
		leaveTypes: [],
		workingHours: {
			standardHoursPerDay: 8,
			standardDaysPerWeek: 5,
		},
		approvalWorkflows: {},
		overtimePolicy: {
			enableOvertime: false,
		},
		dataClassification: 'OFFICIAL',
		residencyTag: 'UK_ONLY',
		createdAt: now,
		updatedAt: now,
	};
}

export async function getHrSettings(
	deps: GetHrSettingsDependencies,
	input: GetHrSettingsInput,
): Promise<GetHrSettingsResult> {
	if (input.orgId !== input.authorization.orgId) {
		throw new AuthorizationError('Cross-tenant HR settings access denied.');
	}

	const settings = await deps.hrSettingsRepository.getSettings(input.authorization.orgId);
	return {
		settings: settings ?? buildDefaultHrSettings(input.authorization.orgId),
	};
}
